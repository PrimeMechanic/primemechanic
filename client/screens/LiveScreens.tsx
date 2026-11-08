import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import {
  apiRequest,
  authHeaders,
  getApiUrl,
  queryClient,
  authFetch,
} from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Row = Record<string, any>;
function useNav() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}
function useData(path: string, enabled = true, interval = false) {
  return useQuery<Row[]>({
    queryKey: [path],
    enabled,
    refetchInterval: interval ? 10000 : false,
  });
}
function useAction() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return {
    error,
    busy,
    run: async (fn: () => Promise<void>) => {
      setBusy(true);
      setError("");
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Please try again");
      } finally {
        setBusy(false);
      }
    },
  };
}
function Page({
  title,
  children,
  error,
  busy,
}: {
  title: string;
  children: React.ReactNode;
  error?: string;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  const inset = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundRoot }}
      contentContainerStyle={{
        padding: 24,
        paddingTop: inset.top + 64,
        paddingBottom: inset.bottom + 110,
        gap: 18,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText style={{ fontSize: 26, fontWeight: "700" }}>
        {title}
      </ThemedText>
      {busy ? <ActivityIndicator /> : null}
      {error ? (
        <ThemedText accessibilityRole="alert" style={{ color: colors.error }}>
          {error}
        </ThemedText>
      ) : null}
      {children}
    </ScrollView>
  );
}
function Tile({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.backgroundDefault,
        gap: 8,
      }}
    >
      {children}
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <ThemedText>{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: colors.border,
          color: colors.text,
        }}
      />
    </View>
  );
}
function QueryState({
  query,
}: {
  query: { isLoading: boolean; error: Error | null; refetch: () => unknown };
}) {
  return (
    <>
      {query.isLoading ? <ActivityIndicator /> : null}
      {query.error ? (
        <>
          <ThemedText accessibilityRole="alert">
            Unable to load: {query.error.message}
          </ThemedText>
          <Button onPress={() => void query.refetch()}>Retry</Button>
        </>
      ) : null}
    </>
  );
}
async function mutate(path: string, body?: unknown, method = "POST") {
  const res = await apiRequest(method, path, body);
  await queryClient.invalidateQueries();
  return res.json();
}
export async function uploadImage(uri: string, mime = "image/jpeg") {
  const res = await apiRequest("POST", "/api/objects/upload");
  const { uploadURL, objectPath } = await res.json();
  if (!uploadURL || !objectPath) throw new Error("Upload could not start");
  const file = await fetch(uri);
  const blob = await file.blob();
  if (blob.size > 10485760) throw new Error("Choose an image under 10 MB");
  const put = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": mime },
    body: blob,
  });
  if (!put.ok) throw new Error("Image upload failed");
  return objectPath as string;
}
function objectSource(uri: string) {
  return { uri: new URL(uri, getApiUrl()).href, headers: authHeaders() };
}
function PrivateImage({
  path,
  height = 200,
}: {
  path: string;
  height?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    let active = true;
    let objectUrl: string | undefined;
    (async () => {
      try {
        const response = await authFetch(path);
        if (!response.ok) throw new Error("Image unavailable");
        objectUrl = URL.createObjectURL(await response.blob());
        if (active) setSrc(objectUrl);
      } catch {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);
  if (error) return <ThemedText>Image unavailable</ThemedText>;
  if (Platform.OS === "web" && !src) return <ActivityIndicator />;
  return (
    <Image
      source={Platform.OS === "web" ? { uri: src! } : objectSource(path)}
      style={{ height, borderRadius: 12 }}
    />
  );
}
export function Browse() {
  const nav = useNav();
  const services = useData("/api/services");
  const mechanics = useData("/api/mechanics");
  const shops = useData("/api/shops");
  return (
    <Page title="Find a mechanic">
      <QueryState query={services} />
      {services.data?.map((s) => (
        <Tile
          key={s.id}
          onPress={() =>
            nav.navigate("BookService", { serviceId: String(s.id) })
          }
        >
          <ThemedText>{s.name}</ThemedText>
          <ThemedText>
            ${s.basePrice} · {s.duration} minutes
          </ThemedText>
        </Tile>
      ))}
      <ThemedText type="h3">Approved mechanics</ThemedText>
      <QueryState query={mechanics} />
      {!mechanics.isLoading && !mechanics.error && !mechanics.data?.length ? (
        <ThemedText>No approved mechanics are available yet.</ThemedText>
      ) : null}
      {mechanics.data?.map((m) => (
        <Tile
          key={m.id}
          onPress={() =>
            nav.navigate("MechanicProfile", { mechanicId: String(m.id) })
          }
        >
          <ThemedText>{m.name}</ThemedText>
          <ThemedText>{m.specialty}</ThemedText>
        </Tile>
      ))}
      <ThemedText type="h3">Shops</ThemedText>
      <QueryState query={shops} />
      {shops.data?.map((s) => (
        <Tile
          key={s.id}
          onPress={() => nav.navigate("ShopProfile", { shopId: String(s.id) })}
        >
          <ThemedText>{s.name}</ThemedText>
        </Tile>
      ))}
    </Page>
  );
}
export function BookService() {
  const nav = useNav();
  const params = useRoute().params as RootStackParamList["BookService"];
  const { user } = useAuth();
  const services = useData("/api/services");
  const mechanics = useData("/api/mechanics");
  const vehicles = useData(`/api/users/${user?.id}/vehicles`, !!user);
  const [service, setService] = useState(params?.serviceId || "");
  const [mechanic, setMechanic] = useState(params?.mechanicId || "");
  const [vehicle, setVehicle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const action = useAction();
  const selected = services.data?.find((s) => String(s.id) === service);
  return (
    <Page title="Book service" error={action.error} busy={action.busy}>
      <ThemedText>
        Service prices are fixed at booking. You pay completed work through
        secure Checkout.
      </ThemedText>
      <QueryState query={services} />
      {services.data?.map((s) => (
        <Tile
          key={s.id}
          onPress={() => {
            setService(String(s.id));
            setMechanic("");
          }}
        >
          <ThemedText>
            {service === String(s.id) ? "✓ " : ""}
            {s.name} · ${s.basePrice}
          </ThemedText>
        </Tile>
      ))}
      <ThemedText type="h3">Choose a mechanic</ThemedText>
      <QueryState query={mechanics} />
      {mechanics.data
        ?.filter((m) => !selected || m.services?.includes(selected.name))
        .map((m) => (
          <Tile key={m.id} onPress={() => setMechanic(String(m.id))}>
            <ThemedText>
              {mechanic === String(m.id) ? "✓ " : ""}
              {m.name}
            </ThemedText>
          </Tile>
        ))}
      <ThemedText type="h3">Choose your vehicle</ThemedText>
      <QueryState query={vehicles} />
      {vehicles.data?.map((v) => (
        <Tile key={v.id} onPress={() => setVehicle(String(v.id))}>
          <ThemedText>
            {vehicle === String(v.id) ? "✓ " : ""}
            {v.year} {v.make} {v.model}
          </ThemedText>
        </Tile>
      ))}
      <Button onPress={() => nav.navigate("AddVehicle")}>Add vehicle</Button>
      <Field
        label="Appointment in your local time (YYYY-MM-DD HH:mm)"
        value={date}
        onChange={setDate}
        placeholder="2026-12-10 10:30"
      />
      <Field label="Service address" value={location} onChange={setLocation} />
      <Field label="Notes" value={notes} onChange={setNotes} />
      {selected ? <ThemedText>Total: ${selected.basePrice}</ThemedText> : null}
      <Button
        disabled={
          action.busy ||
          !user ||
          !service ||
          !mechanic ||
          !vehicle ||
          !date ||
          !location
        }
        onPress={() =>
          void action.run(async () => {
            if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(date))
              throw new Error("Use YYYY-MM-DD HH:mm");
            const parsed = new Date(date.replace(" ", "T"));
            if (!Number.isFinite(parsed.getTime()) || parsed <= new Date())
              throw new Error("Choose a future appointment");
            const booking = await mutate("/api/bookings", {
              serviceId: Number(service),
              mechanicId: Number(mechanic),
              vehicleId: Number(vehicle),
              scheduledDate: parsed.toISOString(),
              location,
              notes,
            });
            nav.replace("BookingDetail", { bookingId: String(booking.id) });
          })
        }
      >
        Request booking
      </Button>
    </Page>
  );
}
function BookingList({ mechanic = false }: { mechanic?: boolean }) {
  const nav = useNav();
  const { user } = useAuth();
  const query = useData(
    mechanic ? "/api/mechanic/jobs" : `/api/users/${user?.id}/bookings`,
    !!user,
    true,
  );
  return (
    <Page title={mechanic ? "My jobs" : "My bookings"}>
      <QueryState query={query} />
      {!query.isLoading && !query.error && !query.data?.length ? (
        <ThemedText>No bookings yet.</ThemedText>
      ) : null}
      {query.data?.map((b) => (
        <Tile
          key={b.id}
          onPress={() =>
            nav.navigate(
              mechanic ? "JobDetail" : "BookingDetail",
              mechanic
                ? { bookingId: String(b.id) }
                : { bookingId: String(b.id) },
            )
          }
        >
          <ThemedText>
            {b.service?.name} · {b.status}
          </ThemedText>
          <ThemedText>{new Date(b.scheduledDate).toLocaleString()}</ThemedText>
          <ThemedText>
            {mechanic ? b.customer?.name : b.mechanic?.name} · ${b.totalPrice}
          </ThemedText>
        </Tile>
      ))}
    </Page>
  );
}
export function Bookings() {
  return <BookingList />;
}
export function Jobs() {
  return <BookingList mechanic />;
}
function Detail({ mechanic = false }: { mechanic?: boolean }) {
  const params = useRoute().params as { bookingId: string };
  const query = useQuery<Row>({
    queryKey: [`/api/bookings/${params.bookingId}`],
    refetchInterval: 10000,
  });
  const photos = useData(
    `/api/bookings/${params.bookingId}/photos`,
    !!query.data,
  );
  const notes = useData(
    `/api/bookings/${params.bookingId}/notes`,
    !!query.data,
  );
  const action = useAction();
  const [note, setNote] = useState("");
  const nav = useNav();
  const b = query.data;
  function status(next: string) {
    void action.run(async () => {
      await mutate(`/api/bookings/${b!.id}/status`, { status: next }, "PATCH");
    });
  }
  async function photo(type: string) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const path = await uploadImage(asset.uri, asset.mimeType || "image/jpeg");
    await mutate(`/api/bookings/${b!.id}/photos`, {
      photoUrl: path,
      photoType: type,
    });
  }
  return (
    <Page
      title={mechanic ? "Job details" : "Booking details"}
      error={action.error}
      busy={action.busy}
    >
      <QueryState query={query} />
      {b ? (
        <>
          <ThemedText type="h3">{b.service?.name}</ThemedText>
          <ThemedText>
            {b.status} · Payment: {b.paymentStatus}
          </ThemedText>
          <ThemedText>{new Date(b.scheduledDate).toLocaleString()}</ThemedText>
          <ThemedText>{b.location}</ThemedText>
          <ThemedText>
            {b.vehicle?.year} {b.vehicle?.make} {b.vehicle?.model}
          </ThemedText>
          <ThemedText>Total ${b.totalPrice}</ThemedText>
          {b.notes ? <ThemedText>{b.notes}</ThemedText> : null}
          {!mechanic ? (
            <>
              <Button
                disabled={action.busy}
                onPress={() =>
                  void action.run(async () => {
                    const c = await mutate("/api/conversations", {
                      mechanicId: b.mechanicId,
                    });
                    nav.navigate("Chat", { conversationId: String(c.id) });
                  })
                }
              >
                Message mechanic
              </Button>
              {["pending", "accepted", "upcoming"].includes(b.status) ? (
                <Button
                  disabled={action.busy}
                  onPress={() => status("cancelled")}
                >
                  Cancel booking
                </Button>
              ) : null}
              {b.status === "completed" && b.paymentStatus === "pending" ? (
                <Button
                  disabled={action.busy}
                  onPress={() =>
                    void action.run(async () => {
                      const result = await mutate(
                        `/api/bookings/${b.id}/checkout`,
                      );
                      if (!result.url) throw new Error("Checkout unavailable");
                      await WebBrowser.openBrowserAsync(result.url);
                      await query.refetch();
                    })
                  }
                >
                  Pay securely
                </Button>
              ) : null}
            </>
          ) : (
            <>
              {b.status === "pending" ? (
                <>
                  <Button
                    disabled={action.busy}
                    onPress={() => status("accepted")}
                  >
                    Accept job
                  </Button>
                  <Button
                    disabled={action.busy}
                    onPress={() => status("declined")}
                  >
                    Decline job
                  </Button>
                </>
              ) : null}
              {["pending", "accepted", "upcoming"].includes(b.status) ? (
                <Button
                  disabled={action.busy}
                  onPress={() => void action.run(() => photo("before"))}
                >
                  Upload before photo
                </Button>
              ) : null}
              {["accepted", "upcoming"].includes(b.status) ? (
                <Button
                  disabled={action.busy}
                  onPress={() => status("in_progress")}
                >
                  Start job
                </Button>
              ) : null}
              {b.status === "in_progress" ? (
                <>
                  <Button
                    disabled={action.busy}
                    onPress={() => void action.run(() => photo("after"))}
                  >
                    Upload after photo
                  </Button>
                  <Button
                    disabled={action.busy}
                    onPress={() => status("completed")}
                  >
                    Complete job
                  </Button>
                </>
              ) : null}
              <Field label="Job note" value={note} onChange={setNote} />
              <Button
                disabled={action.busy || !note.trim()}
                onPress={() =>
                  void action.run(async () => {
                    await mutate(`/api/bookings/${b.id}/notes`, {
                      content: note.trim(),
                    });
                    setNote("");
                  })
                }
              >
                Save note
              </Button>
            </>
          )}
          <ThemedText type="h3">Photos</ThemedText>
          <QueryState query={photos} />
          {photos.data?.map((p) => (
            <View key={p.id}>
              <ThemedText>{p.photoType}</ThemedText>
              <PrivateImage path={p.photoUrl} />
            </View>
          ))}
          <ThemedText type="h3">Notes</ThemedText>
          <QueryState query={notes} />
          {notes.data?.map((n) => (
            <ThemedText key={n.id}>{n.content}</ThemedText>
          ))}
        </>
      ) : null}
    </Page>
  );
}
export function BookingDetail() {
  return <Detail />;
}
export function JobDetail() {
  return <Detail mechanic />;
}
export function Messages() {
  const { user } = useAuth();
  const nav = useNav();
  const query = useData(`/api/users/${user?.id}/conversations`, !!user, true);
  return (
    <Page title="Messages">
      <QueryState query={query} />
      {!query.isLoading && !query.error && !query.data?.length ? (
        <ThemedText>No conversations yet.</ThemedText>
      ) : null}
      {query.data?.map((c) => (
        <Tile
          key={c.id}
          onPress={() => nav.navigate("Chat", { conversationId: String(c.id) })}
        >
          <ThemedText>{c.title || "Conversation"}</ThemedText>
          <ThemedText>{new Date(c.lastMessageAt).toLocaleString()}</ThemedText>
        </Tile>
      ))}
    </Page>
  );
}
export function Chat() {
  const { user } = useAuth();
  const params = useRoute().params as { conversationId: string };
  const query = useData(
    `/api/conversations/${params.conversationId}/messages`,
    !!user,
    true,
  );
  const [message, setMessage] = useState("");
  const action = useAction();
  return (
    <Page title="Conversation" error={action.error} busy={action.busy}>
      <QueryState query={query} />
      {query.data?.map((m) => (
        <Tile key={m.id}>
          <ThemedText>
            {m.senderId === user?.id ? "You" : "Participant"} ·{" "}
            {new Date(m.createdAt).toLocaleString()}
          </ThemedText>
          <ThemedText>{m.content}</ThemedText>
        </Tile>
      ))}
      <Field label="Message" value={message} onChange={setMessage} />
      <Button
        disabled={action.busy || !message.trim()}
        onPress={() =>
          void action.run(async () => {
            await mutate("/api/messages", {
              conversationId: Number(params.conversationId),
              content: message.trim(),
            });
            setMessage("");
          })
        }
      >
        Send
      </Button>
    </Page>
  );
}
export function MechanicProfile() {
  const params = useRoute().params as { mechanicId: string };
  const query = useQuery<Row>({
    queryKey: [`/api/mechanics/${params.mechanicId}`],
  });
  const portfolio = useData(`/api/mechanics/${params.mechanicId}/portfolio`);
  const nav = useNav();
  const action = useAction();
  const m = query.data;
  return (
    <Page title="Mechanic" error={action.error}>
      <QueryState query={query} />
      {m ? (
        <>
          <ThemedText type="h3">{m.name}</ThemedText>
          <ThemedText>{m.specialty}</ThemedText>
          <ThemedText>{m.bio}</ThemedText>
          <ThemedText>
            {m.completedJobs || 0} completed jobs · {m.reviewCount || 0} reviews
          </ThemedText>
          <Button
            onPress={() =>
              nav.navigate("BookService", { mechanicId: String(m.id) })
            }
          >
            Book service
          </Button>
          <Button
            disabled={action.busy}
            onPress={() =>
              void action.run(async () => {
                const c = await mutate("/api/conversations", {
                  mechanicId: m.id,
                });
                nav.navigate("Chat", { conversationId: String(c.id) });
              })
            }
          >
            Message
          </Button>
          <QueryState query={portfolio} />
          {portfolio.data?.map((p) => (
            <PrivateImage key={p.id} path={p.imageUrl} height={220} />
          ))}
        </>
      ) : null}
    </Page>
  );
}
export function ShopProfile() {
  const params = useRoute().params as { shopId: string };
  const query = useQuery<Row>({ queryKey: [`/api/shops/${params.shopId}`] });
  const s = query.data;
  return (
    <Page title="Shop">
      <QueryState query={query} />
      {s ? (
        <>
          <ThemedText type="h3">{s.name}</ThemedText>
          <ThemedText>{s.description}</ThemedText>
          <ThemedText>
            {s.street}, {s.city}, {s.state} {s.zipCode}
          </ThemedText>
          <ThemedText>{s.phone}</ThemedText>
          <ThemedText>
            Contact this shop directly. In-app booking is available for approved
            mobile mechanics.
          </ThemedText>
        </>
      ) : null}
    </Page>
  );
}
export function Earnings() {
  const { user } = useAuth();
  const query = useData("/api/mechanic/jobs", !!user, true);
  const paid =
    query.data?.filter(
      (b) => b.paymentStatus === "paid" && b.status === "completed",
    ) || [];
  const total = paid.reduce((sum, b) => sum + Number(b.mechanicPayout || 0), 0);
  return (
    <Page title="Earnings">
      <QueryState query={query} />
      <ThemedText type="h3">
        ${total.toFixed(2)} from paid completed jobs
      </ThemedText>
      <ThemedText>
        These are service earnings. Bank payout timing and refunds are managed
        by Stripe and support.
      </ThemedText>
      {paid.map((b) => (
        <Tile key={b.id}>
          <ThemedText>
            Booking #{b.id} · ${b.mechanicPayout}
          </ThemedText>
        </Tile>
      ))}
    </Page>
  );
}
export function Account() {
  const { user, signOut } = useAuth();
  const { role, toggleRole } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const nav = useNav();
  const profile = useQuery<Row>({
    queryKey: [`/api/users/${user?.id}/mechanic-profile`],
    enabled: user?.role === "mechanic",
  });
  const action = useAction();
  const vehicles = useData(`/api/users/${user?.id}/vehicles`, !!user);
  const portfolio = useData(
    `/api/mechanics/${profile.data?.id}/portfolio`,
    !!profile.data?.id,
  );
  return (
    <Page title="Account" error={action.error} busy={action.busy}>
      <ThemedText type="h3">{user?.name}</ThemedText>
      <ThemedText>{user?.email}</ThemedText>
      {user?.role === "mechanic" ? (
        <>
          <QueryState query={profile} />
          <ThemedText>
            Screening: {profile.data?.screeningStatus || "pending"}
          </ThemedText>
          <ThemedText>
            Payout setup:{" "}
            {profile.data?.stripeConnectOnboarded ? "Ready" : "Required"}
          </ThemedText>
          <Button
            disabled={action.busy}
            onPress={() =>
              void action.run(async () => {
                const result = await mutate("/api/mechanic/connect");
                await WebBrowser.openBrowserAsync(result.url);
                await mutate("/api/mechanic/connect/refresh");
              })
            }
          >
            Set up payouts
          </Button>
          <Button
            disabled={action.busy}
            onPress={() =>
              void action.run(async () => {
                await mutate("/api/mechanic/connect/refresh");
              })
            }
          >
            Refresh payout status
          </Button>
          {profile.data?.isVerified ? (
            <Button
              disabled={action.busy}
              onPress={() =>
                void action.run(async () => {
                  await mutate(
                    "/api/mechanic/availability",
                    { isAvailable: !profile.data?.isAvailable },
                    "PATCH",
                  );
                })
              }
            >
              {profile.data.isAvailable
                ? "Go unavailable"
                : "Accept new bookings"}
            </Button>
          ) : null}
          <Button
            disabled={action.busy || !profile.data?.id}
            onPress={() =>
              void action.run(async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ["images"],
                  quality: 0.8,
                });
                if (result.canceled) return;
                const asset = result.assets[0];
                const path = await uploadImage(
                  asset.uri,
                  asset.mimeType || "image/jpeg",
                );
                await mutate("/api/portfolio", {
                  mechanicId: profile.data?.id,
                  uploadURL: path,
                });
              })
            }
          >
            Add portfolio photo
          </Button>
          <QueryState query={portfolio} />
          {portfolio.data?.map((p) => (
            <Tile key={p.id}>
              <PrivateImage path={p.imageUrl} height={150} />
              <Button
                disabled={action.busy}
                onPress={() =>
                  void action.run(async () => {
                    await mutate(`/api/portfolio/${p.id}`, undefined, "DELETE");
                  })
                }
              >
                Remove portfolio photo
              </Button>
            </Tile>
          ))}
          <Button onPress={toggleRole}>
            Switch to {role === "mechanic" ? "customer" : "mechanic"} view
          </Button>
        </>
      ) : null}
      <ThemedText type="h3">Your vehicles</ThemedText>
      <QueryState query={vehicles} />
      {vehicles.data?.map((v) => (
        <Tile key={v.id}>
          <ThemedText>
            {v.year} {v.make} {v.model}
          </ThemedText>
          <Button
            disabled={action.busy}
            onPress={() =>
              void action.run(async () => {
                await mutate(`/api/vehicles/${v.id}`, undefined, "DELETE");
              })
            }
          >
            Remove vehicle
          </Button>
        </Tile>
      ))}
      <Button onPress={() => nav.navigate("AddVehicle")}>Add vehicle</Button>
      <Button onPress={() => nav.navigate("SavedAddresses")}>
        Saved addresses
      </Button>
      <Button onPress={() => nav.navigate("PaymentMethods")}>
        Payment methods
      </Button>
      <Button onPress={toggleTheme}>
        {isDark ? "Light" : "Dark"} appearance
      </Button>
      <Button disabled={action.busy} onPress={() => void action.run(signOut)}>
        Sign out
      </Button>
    </Page>
  );
}

export function PaymentMethods() {
  const { user } = useAuth();
  const query = useData(`/api/users/${user?.id}/payment-methods`, !!user);
  const action = useAction();
  return (
    <Page title="Payment methods" error={action.error} busy={action.busy}>
      <QueryState query={query} />
      {query.data?.map((card) => (
        <Tile key={card.id}>
          <ThemedText>
            {card.brand} ···· {card.last4} {card.isDefault ? "· Default" : ""}
          </ThemedText>
          <Button
            disabled={action.busy}
            onPress={() =>
              void action.run(async () => {
                await mutate(`/api/payment-methods/${card.id}/default`, {});
              })
            }
          >
            Make default
          </Button>
          <Button
            disabled={action.busy}
            onPress={() =>
              void action.run(async () => {
                await mutate(
                  `/api/payment-methods/${card.id}`,
                  undefined,
                  "DELETE",
                );
              })
            }
          >
            Remove card
          </Button>
        </Tile>
      ))}
      <Button
        disabled={action.busy}
        onPress={() =>
          void action.run(async () => {
            const result = await mutate(
              `/api/users/${user?.id}/checkout-setup`,
            );
            if (!result.url) throw new Error("Unable to start card setup");
            await WebBrowser.openBrowserAsync(result.url);
            await query.refetch();
          })
        }
      >
        Add card securely
      </Button>
      <Button onPress={() => void query.refetch()}>
        Refresh cards after setup
      </Button>
    </Page>
  );
}
