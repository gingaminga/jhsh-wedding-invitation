type AttendanceNotification = {
  kind: "attendance";
  side: "groom" | "bride";
  attendance: "attending" | "not-attending";
  name: string;
  guestCount: number;
};

type BusNotification = {
  kind: "bus";
  name: string;
  phone: string;
  passengerCount: number;
  note: string;
};

type GuestbookNotification = {
  kind: "guestbook";
  name: string;
  message: string;
};

export type DiscordNotification = AttendanceNotification | BusNotification | GuestbookNotification;

type DiscordField = {
  name: string;
  value: string;
  inline?: boolean;
};

const COLORS = {
  attendance: 0x789985,
  absence: 0xb98282,
  bus: 0x6d8fa7,
  guestbook: 0xb4838c,
};

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "-";
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

function field(name: string, value: string | number, inline = true): DiscordField {
  return { name, value: String(value).slice(0, 1024), inline };
}

function buildEmbed(notification: DiscordNotification) {
  const common = {
    timestamp: new Date().toISOString(),
    footer: { text: "지환 ♥ 서희 모바일 청첩장" },
  };

  if (notification.kind === "attendance") {
    const attending = notification.attendance === "attending";
    return {
      ...common,
      title: attending ? "💌 참석 응답이 도착했어요" : "💌 불참 응답이 도착했어요",
      color: attending ? COLORS.attendance : COLORS.absence,
      fields: [
        field("구분", notification.side === "groom" ? "신랑 측" : "신부 측"),
        field("참석 여부", attending ? "참석" : "불참"),
        field("성함", notification.name),
        field("참석 인원", `${notification.guestCount}명`),
      ],
    };
  }

  if (notification.kind === "bus") {
    const fields = [
      field("대표자", notification.name),
      field("연락처", maskPhone(notification.phone)),
      field("탑승 인원", `${notification.passengerCount}명`),
    ];
    if (notification.note) fields.push(field("전달 사항", notification.note, false));

    return {
      ...common,
      title: "🚌 전세버스 응답이 도착했어요",
      color: COLORS.bus,
      fields,
    };
  }

  return {
    ...common,
    title: "🌷 새 축하 메시지가 도착했어요",
    color: COLORS.guestbook,
    fields: [
      field("작성자", notification.name),
      field("메시지", notification.message, false),
    ],
  };
}

function getWebhookUrl() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  const threadId = process.env.DISCORD_THREAD_ID?.trim();
  if (!webhookUrl || !threadId) return null;
  if (!/^\d{17,20}$/.test(threadId)) throw new Error("Discord 스레드 ID 형식이 올바르지 않습니다.");

  const url = new URL(webhookUrl);
  url.searchParams.set("thread_id", threadId);
  url.searchParams.set("wait", "true");
  return url;
}

export async function notifyDiscord(notification: DiscordNotification) {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    console.warn("Discord 알림 설정이 없어 전송을 건너뜁니다.");
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "웨딩 알리미",
      allowed_mentions: { parse: [] },
      embeds: [buildEmbed(notification)],
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord 알림 전송 실패: ${response.status}`);
  }
}

export async function notifyDiscordSafely(notification: DiscordNotification) {
  try {
    await notifyDiscord(notification);
  } catch (error) {
    console.error("Discord 알림을 보내지 못했습니다.", error);
  }
}
