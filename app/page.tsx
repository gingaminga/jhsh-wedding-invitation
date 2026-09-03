"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const WEDDING_AT = new Date("2026-10-25T12:10:00+09:00");
const GALLERY = Array.from({ length: 17 }, (_, index) =>
  `/images/section-04-gallery-${String(index + 1).padStart(2, "0")}.jpg`,
);

const TIMELINE = [
  { year: "2018", label: "OUR BEGINNING", title: "우리의 시작", copy: "서로의 일상에 천천히 스며들며\n두 사람의 이야기가 시작되었습니다.", image: "/images/section-02-2018.jpg" },
  { year: "2019", label: "ONE YEAR", title: "함께 맞은 첫해", copy: "서로의 하루를 나누는 일이\n조금씩 자연스러워졌습니다.", image: "/images/section-02-2019.jpg" },
  { year: "2020", label: "SIDE BY SIDE", title: "익숙해진 우리", copy: "함께하는 날들이 쌓이며\n서로의 든든한 편이 되었습니다.", image: "/images/section-02-2020.jpg" },
  { year: "2021", label: "LITTLE JOYS", title: "소소한 행복", copy: "평범한 날의 작은 기쁨도\n함께라서 더 특별했습니다.", image: "/images/section-02-2021.jpg" },
  { year: "2022", label: "TOGETHER", title: "함께한 시간", copy: "기쁨도 걱정도 나란히 나누며\n서로에게 가장 편안한 사람이 되었습니다.", image: "/images/section-02-2022.jpg" },
  { year: "2023", label: "EVERYDAY US", title: "우리다운 일상", copy: "수많은 계절을 함께 지나며\n우리만의 추억을 채워갔습니다.", image: "/images/section-02-2023.jpg" },
  { year: "2024", label: "ONE DIRECTION", title: "같은 곳을 바라보며", copy: "오랜 시간 쌓아온 믿음을 품고\n같은 방향으로 걷기 시작했습니다.", image: "/images/section-02-2024.jpg" },
  { year: "2025", label: "CLOSER TO FOREVER", title: "약속에 가까이", copy: "여덟 해의 인연을 품고\n평생의 연을 준비했습니다.", image: "/images/section-02-2025.jpg" },
  { year: "2026", label: "THE WEDDING", title: "평생을 약속합니다", copy: "여덟 해의 연인에서 평생의 가족으로,\n새로운 이야기를 시작합니다.", image: "/images/section-02-2026.jpg" },
];

const ACCOUNTS = [
  {
    side: "신랑측",
    tone: "groom",
    people: [
      { relation: "신랑", name: "최지환", bank: "카카오뱅크", number: "3333025723576" },
      { relation: "아버지", name: "최상운", bank: "농협", number: "41505756046605" },
      { relation: "어머니", name: "최은주", bank: "농협", number: "23701156007751" },
    ],
  },
  {
    side: "신부측",
    tone: "bride",
    people: [
      { relation: "신부", name: "윤서희", bank: "국민은행", number: "74890200091616" },
      { relation: "아버지", name: "윤숭열", bank: "우리은행", number: "1002607309184" },
      { relation: "어머니", name: "이지연", bank: "우리은행", number: "1002509509129" },
    ],
  },
];

type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (appKey: string) => void;
      Share: {
        sendDefault: (options: {
          objectType: "feed";
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: { mobileWebUrl: string; webUrl: string };
          };
          buttons: Array<{ title: string; link: { mobileWebUrl: string; webUrl: string } }>;
        }) => void | Promise<unknown>;
      };
    };
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: unknown) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: unknown) => { setMap: (map: unknown) => void };
        ZoomControl: new () => unknown;
        ControlPosition: { RIGHT: unknown };
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (result: Array<{ x: string; y: string }>, status: string) => void,
            ) => void;
          };
          Status: { OK: string };
        };
      };
    };
  }
}

function KakaoShareButton() {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!appKey) return;
    const initialize = () => {
      if (!window.Kakao) return;
      if (!window.Kakao.isInitialized()) window.Kakao.init(appKey);
      setSdkReady(true);
    };
    if (window.Kakao) {
      initialize();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.2/kakao.min.js";
    script.async = true;
    script.onload = initialize;
    document.head.appendChild(script);
    return () => script.remove();
  }, [appKey]);

  const copyShareLink = async (pageUrl: string, popupBlocked = false) => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      window.prompt("아래 청첩장 주소를 복사해 주세요.", pageUrl);
      return;
    }
    window.alert(
      popupBlocked
        ? "카카오톡 공유 팝업이 차단되어 청첩장 주소를 복사했습니다. 브라우저에서 팝업을 허용한 뒤 다시 시도해 주세요."
        : "청첩장 주소를 복사했습니다.",
    );
  };

  const share = () => {
    const pageUrl = window.location.href;
    if (sdkReady && window.Kakao) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const popup = isMobile
        ? null
        : window.open(
            "about:blank",
            "sharer",
            "width=480,height=700,scrollbars=yes,resizable=1",
          );

      if (!isMobile && !popup) {
        void copyShareLink(pageUrl, true);
        return;
      }

      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: "최지환 ♥ 윤서희, 결혼합니다",
            description: "2026년 10월 25일 일요일 오후 12시 10분 · 수원 마이어스",
            imageUrl: new URL("/og.png", window.location.origin).href,
            link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
          },
          buttons: [
            { title: "청첩장 보기", link: { mobileWebUrl: pageUrl, webUrl: pageUrl } },
          ],
        });
      } catch {
        popup?.close();
        void copyShareLink(pageUrl, true);
      }
      return;
    }
    void copyShareLink(pageUrl);
  };

  return <button type="button" className="kakao-share-button" onClick={share}><span aria-hidden="true">♥</span> 카카오톡으로 청첩장 공유하기</button>;
}

function LinkCopyButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const pageUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const input = document.createElement("textarea");
      input.value = pageUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return <button type="button" className={`link-copy-button ${copied ? "is-copied" : ""}`} onClick={copy}>{copied ? "링크를 복사했어요 ✓" : "청첩장 링크 복사하기"}</button>;
}

function IntroPhoto({ src, label, className, onReady }: { src: string; label: string; className: string; onReady: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const readyReported = useRef(false);
  const markAsReady = useCallback(() => {
    if (readyReported.current) return;
    readyReported.current = true;
    setLoaded(true);
    onReady();
  }, [onReady]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) markAsReady();
  }, [markAsReady]);

  return (
    <div className={`portrait ${className}`}>
      {!loaded && (
        <div className="photo-placeholder">
          <span className="placeholder-mark">J · S</span>
          <small>{label}</small>
        </div>
      )}
      <img ref={imageRef} src={src} alt={label} onLoad={markAsReady} className={loaded ? "is-loaded" : ""} />
    </div>
  );
}

function GreetingSequence({ onComplete }: { onComplete: () => void }) {
  const [firstReady, setFirstReady] = useState(false);
  const [secondReady, setSecondReady] = useState(false);

  useEffect(() => {
    if (!firstReady || !secondReady) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(onComplete, reduceMotion ? 0 : 2300);
    return () => window.clearTimeout(timer);
  }, [firstReady, onComplete, secondReady]);

  return (
    <div className={`couple-intro ${firstReady && secondReady ? "is-ready" : ""}`} aria-label="정면 사진에서 인사 사진으로 이어지는 커플 사진">
      <IntroPhoto src="/images/intro-1.jpg" label="한복을 입고 정면을 바라보는 지환과 서희" className="portrait-one" onReady={() => setFirstReady(true)} />
      <IntroPhoto src="/images/intro-2.jpg" label="한복을 입고 함께 인사하는 지환과 서희" className="portrait-two" onReady={() => setSecondReady(true)} />
      <div className="greeting-caption">
        <span>WELCOME TO OUR WEDDING</span>
        <strong>귀한 걸음, 감사합니다</strong>
      </div>
    </div>
  );
}

function GreetingIntro() {
  const [completed, setCompleted] = useState(false);
  const completeGreeting = useCallback(() => setCompleted(true), []);

  useEffect(() => {
    if (!completed) {
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      root.style.scrollBehavior = previousScrollBehavior;
    }
    document.body.classList.toggle("greeting-locked", !completed);
    return () => document.body.classList.remove("greeting-locked");
  }, [completed]);

  return (
    <div className="greeting-stage">
      <GreetingSequence onComplete={completeGreeting} />
    </div>
  );
}

function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const removeFallbackListeners = () => {
      window.removeEventListener("pointerdown", playOnFirstInteraction);
      window.removeEventListener("keydown", playOnFirstInteraction);
    };
    const tryPlay = () => {
      void audio.play().then(removeFallbackListeners).catch(() => {
        window.addEventListener("pointerdown", playOnFirstInteraction, { once: true });
        window.addEventListener("keydown", playOnFirstInteraction, { once: true });
      });
    };
    function playOnFirstInteraction() {
      tryPlay();
    }

    tryPlay();
    return removeFallbackListeners;
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  return (
    <div className="bgm-player">
      <audio
        ref={audioRef}
        src="/audio/gentle-holiday-drift.mp3"
        autoPlay
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        className={isPlaying ? "is-playing" : ""}
        onClick={toggleMusic}
        aria-label={isPlaying ? "배경 음악 끄기" : "배경 음악 재생"}
        aria-pressed={isPlaying}
      >
        <span className="bgm-bars" aria-hidden="true"><i /><i /><i /></span>
        <small>BGM</small>
      </button>
    </div>
  );
}

function SectionHeading({ eyebrow, index, children }: { eyebrow: string; index: string; children: React.ReactNode }) {
  return (
    <header className="section-heading" data-index={index}>
      <p>{eyebrow}</p>
      <h2>{children}</h2>
      <span aria-hidden="true">◆</span>
    </header>
  );
}

function RelationshipTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const moveTo = (index: number) => {
    const next = Math.max(0, Math.min(TIMELINE.length - 1, index));
    const track = trackRef.current;
    const item = track?.children[next] as HTMLElement | undefined;
    if (track && item) track.scrollTo({ left: item.offsetLeft - 28, behavior: "smooth" });
    setActive(next);
  };

  const syncActive = () => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const closest = items.reduce((best, item, index) =>
      Math.abs(item.offsetLeft - track.scrollLeft - 28) < Math.abs(items[best].offsetLeft - track.scrollLeft - 28) ? index : best, 0);
    setActive(closest);
  };

  return (
    <section className="timeline-section reveal-section" data-reveal aria-label="지환과 서희의 8년 타임라인">
      <div className="timeline-heading-wrap">
        <SectionHeading eyebrow="OUR STORY · EIGHT YEARS" index="02">우리의 시간</SectionHeading>
        <p>손끝으로 넘겨보는<br />우리의 여덟 해</p>
      </div>
      <div className="timeline-frame">
        <div
          className="timeline-track"
          ref={trackRef}
          onScroll={syncActive}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") moveTo(active - 1);
            if (event.key === "ArrowRight") moveTo(active + 1);
          }}
          tabIndex={0}
          role="group"
          aria-label="연도별 이야기. 좌우 방향키로 이동할 수 있습니다."
        >
          {TIMELINE.map((item, index) => (
            <article className={`timeline-card ${active === index ? "is-active" : ""}`} key={item.year} aria-label={`${item.year}년 ${item.title}`}>
              <img src={item.image} alt="" loading={index === 0 ? "eager" : "lazy"} />
              <div className="timeline-overlay" />
              <div className="timeline-year">{item.year}</div>
              <div className="timeline-copy">
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.copy.split("\n").map((line) => <span key={line}>{line}</span>)}</p>
              </div>
            </article>
          ))}
        </div>
        <button type="button" className="timeline-arrow timeline-prev" onClick={() => moveTo(active - 1)} disabled={active === 0} aria-label="이전 이야기">‹</button>
        <button type="button" className="timeline-arrow timeline-next" onClick={() => moveTo(active + 1)} disabled={active === TIMELINE.length - 1} aria-label="다음 이야기">›</button>
      </div>
      <div className="timeline-progress" aria-label={`전체 ${TIMELINE.length}개 중 ${active + 1}번째`}>
        {TIMELINE.map((item, index) => (
          <button type="button" className={active === index ? "is-active" : ""} onClick={() => moveTo(index)} key={item.year} aria-label={`${item.year}년으로 이동`}>
            <span>{item.year}</span>
          </button>
        ))}
      </div>
      <p className="timeline-hint">SWIPE · DRAG · ARROW KEYS</p>
    </section>
  );
}

function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  useEffect(() => {
    if (!appKey || !mapRef.current) return;
    const renderMap = () => {
      window.kakao?.maps.load(() => {
        if (!mapRef.current || !window.kakao) return;
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch("경기 수원시 권선구 경수대로 270", (result, status) => {
          if (!mapRef.current || !window.kakao || status !== window.kakao.maps.services.Status.OK) return;
          const center = new window.kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
          const map = new window.kakao.maps.Map(mapRef.current, { center, level: 3 });
          new window.kakao.maps.Marker({ position: center }).setMap(map);
          setReady(true);
        });
      });
    };

    if (window.kakao?.maps) {
      renderMap();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = renderMap;
    document.head.appendChild(script);
    return () => script.remove();
  }, [appKey]);

  return (
    <div className={`map-wrap ${ready ? "map-ready" : ""}`}>
      <div ref={mapRef} className="map-canvas" aria-label="수원 마이어스 위치 지도" />
      {!ready && (
        <div className="map-fallback">
          <span className="map-pin" aria-hidden="true">●</span>
          <strong>수원 마이어스</strong>
          <p>카카오맵 연결 준비 중</p>
          {!appKey && <small>배포 전 카카오맵 앱 키를 등록하면 지도가 표시됩니다.</small>}
        </div>
      )}
    </div>
  );
}

function BusSurveyForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const counts = Array.from({ length: 11 }, (_, index) => index);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/bus-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          passengerCount: data.get("passengerCount"),
          note: data.get("note"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setStatus("수요조사 응답이 저장되었습니다. 같은 연락처로 다시 제출하면 응답이 수정됩니다.");
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      onSuccess();
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : "응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bus-survey">
      <div className="bus-route-summary"><span>안성 출발</span><strong>오전 10시</strong><p>한경대학교 산학협력관 주차장 탑승</p></div>
      <p className="bus-survey-copy">원활한 차량 준비를 위한 예상 인원 조사입니다.<br />신청이 좌석 확정을 의미하지는 않습니다.</p>
      <form className="bus-survey-form" onSubmit={submit}>
        <div className="input-row">
          <label>대표자 이름<input name="name" maxLength={20} required placeholder="이름" autoComplete="name" /></label>
          <label>연락처<input name="phone" type="tel" inputMode="tel" required placeholder="010-0000-0000" autoComplete="tel" /></label>
        </div>
        <label>탑승 인원
          <select name="passengerCount" defaultValue="1" aria-label="전세버스 탑승 인원">
            {counts.slice(1).map((count) => <option value={count} key={count}>{count}명</option>)}
          </select>
        </label>
        <label>전달 사항<textarea name="note" maxLength={200} placeholder="어린이 동반, 짐 등 전달 사항이 있다면 적어주세요." /></label>
        <label className="survey-consent"><input type="checkbox" required /> <span>탑승 안내를 위한 이름·연락처 수집에 동의합니다.</span></label>
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "저장 중..." : "수요조사 제출하기"}</button>
      </form>
      <p className="bus-survey-footnote">같은 연락처로 다시 제출하면 가장 최근 응답으로 수정됩니다.<br />동일 인원이 왕복 탑승하며, 귀가편은 예식 종료 후 기사님 안내에 따라 출발합니다.</p>
      {status && <p className={`bus-survey-status ${status.includes("저장되었습니다") ? "is-success" : ""}`} role="status">{status}</p>}
    </div>
  );
}

function AttendanceSurveyForm({ onSuccess }: { onSuccess: () => void }) {
  const [attendance, setAttendance] = useState("attending");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const counts = Array.from({ length: 10 }, (_, index) => index + 1);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/attendance-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side: data.get("side"),
          attendance,
          name: data.get("name"),
          guestCount: attendance === "attending" ? data.get("guestCount") : 0,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setStatus("참석 응답이 저장되었습니다.");
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      onSuccess();
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : "응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="attendance-survey">
      <p className="bus-survey-copy">원활한 예식 준비를 위해 예상 참석 인원을 파악하고 있습니다.</p>
      <form className="bus-survey-form" onSubmit={submit}>
        <fieldset className="survey-choice-group">
          <legend>참석 여부</legend>
          <div>
            <label><input type="radio" name="attendance" value="attending" checked={attendance === "attending"} onChange={() => setAttendance("attending")} /><span>참석할게요</span></label>
            <label><input type="radio" name="attendance" value="not-attending" checked={attendance === "not-attending"} onChange={() => setAttendance("not-attending")} /><span>참석이 어려워요</span></label>
          </div>
        </fieldset>
        <fieldset className="survey-choice-group">
          <legend>하객 구분</legend>
          <div>
            <label><input type="radio" name="side" value="groom" required /><span>신랑측</span></label>
            <label><input type="radio" name="side" value="bride" required /><span>신부측</span></label>
          </div>
        </fieldset>
        <label>성함<input name="name" maxLength={20} required placeholder="이름" autoComplete="name" /></label>
        {attendance === "attending" && (
          <div className="survey-attending-fields">
            <label>참석 인원
              <select name="guestCount" defaultValue="1" aria-label="결혼식 참석 인원">
                {counts.map((count) => <option value={count} key={count}>{count}명</option>)}
              </select>
            </label>
          </div>
        )}
        <label className="survey-consent"><input type="checkbox" required /> <span>참석 인원 확인을 위한 성함·하객 구분 수집에 동의합니다.</span></label>
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? "저장 중..." : "참석 여부 제출하기"}</button>
      </form>
      {status && <p className={`bus-survey-status ${status.includes("저장되었습니다") ? "is-success" : ""}`} role="status">{status}</p>}
    </div>
  );
}

export default function Home() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showAllGuestbook, setShowAllGuestbook] = useState(false);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [guestbookStatus, setGuestbookStatus] = useState("불러오는 중...");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [surveyLayer, setSurveyLayer] = useState<"attendance" | "bus" | null>(null);
  const [openAccount, setOpenAccount] = useState<string | null>(null);

  const dDay = useMemo(() => {
    const diff = WEDDING_AT.getTime() - Date.now();
    const days = Math.ceil(diff / 86_400_000);
    if (days > 0) return `D-${days}`;
    if (days === 0) return "D-DAY";
    return `D+${Math.abs(days)}`;
  }, []);

  const loadGuestbook = async () => {
    try {
      const response = await fetch("/api/guestbook");
      const data = (await response.json()) as { entries?: GuestbookEntry[]; error?: string; unavailable?: boolean };
      if (!response.ok) throw new Error(data.error);
      setGuestbook(data.entries ?? []);
      setGuestbookStatus(data.unavailable ? "로컬 방명록은 Supabase 환경 설정 후 표시됩니다." : data.entries?.length ? "" : "첫 축하 메시지를 남겨주세요.");
    } catch {
      setGuestbookStatus("방명록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  useEffect(() => { loadGuestbook(); }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox === null && !showAllGuestbook && deleteTarget === null && surveyLayer === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
        setShowAllGuestbook(false);
        setDeleteTarget(null);
        setSurveyLayer(null);
      }
      if (lightbox !== null && event.key === "ArrowRight") setLightbox((lightbox + 1) % GALLERY.length);
      if (lightbox !== null && event.key === "ArrowLeft") setLightbox((lightbox - 1 + GALLERY.length) % GALLERY.length);
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, showAllGuestbook, deleteTarget, surveyLayer]);

  const moveGallery = (direction: number) => {
    galleryRef.current?.scrollBy({ left: direction * galleryRef.current.clientWidth * 0.82, behavior: "smooth" });
  };

  const copyAccount = async (number: string) => {
    await navigator.clipboard.writeText(number);
    window.alert("계좌번호를 복사했습니다.");
  };

  const submitGuestbook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setGuestbookStatus("메시지를 남기는 중...");
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          message: formData.get("message"),
          password: formData.get("password"),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error);
      form.reset();
      await loadGuestbook();
    } catch (error) {
      setGuestbookStatus(error instanceof Error ? error.message : "메시지를 남기지 못했어요.");
    }
  };

  const deleteGuestbook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (deleteTarget === null) return;
    const password = new FormData(event.currentTarget).get("deletePassword");
    const response = await fetch(`/api/guestbook/${deleteTarget}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      window.alert(data.error ?? "삭제하지 못했습니다.");
      return;
    }
    setDeleteTarget(null);
    await loadGuestbook();
  };

  const GuestbookList = ({ entries }: { entries: GuestbookEntry[] }) => (
    <div className="guestbook-list">
      {entries.map((entry) => (
        <article className="guestbook-entry" key={entry.id}>
          <div className="guestbook-entry-head">
            <span className="guestbook-avatar" aria-hidden="true">{entry.name.slice(0, 1)}</span>
            <div>
              <strong>{entry.name}</strong>
              <time>{new Date(entry.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}</time>
            </div>
          </div>
          <p>{entry.message}</p>
          <button type="button" onClick={() => setDeleteTarget(entry.id)} aria-label={`${entry.name}님의 방명록 삭제`}>삭제</button>
        </article>
      ))}
    </div>
  );

  return (
    <main className="invitation-shell">
      <BackgroundMusic />
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">WE ARE GETTING MARRIED</p>
        <GreetingIntro />
        <h1 id="hero-title">지환 <span>&amp;</span> 서희</h1>
        <p className="hero-date">2026 · 10 · 25 · SUN</p>
        <p className="hero-place">오후 12시 10분 · 수원 마이어스</p>
        <div className="scroll-cue" aria-hidden="true"><span /></div>
      </section>

      <section className="section invitation-message reveal-section" data-reveal>
        <SectionHeading eyebrow="INVITATION" index="01">소중한 분들을 초대합니다</SectionHeading>
        <p className="message-copy">
          여덟 해의 인연을 품고<br />평생의 연을 맺고자 합니다.<br /><br />
          서로를 아끼고 존중하는 마음으로<br />늘 같은 곳을 바라보며 살아가겠습니다.<br /><br />
          귀한 걸음 하시어<br />축복해 주시면 감사하겠습니다.
        </p>
        <div className="family-lines">
          <div className="family family-groom"><small>GROOM</small><p><span>최상운 · 최은주</span>의 장남 <strong>지환</strong></p></div>
          <div className="family family-bride"><small>BRIDE</small><p><span>윤숭열 · 이지연</span>의 장녀 <strong>서희</strong></p></div>
        </div>
      </section>

      <RelationshipTimeline />

      <section className="section date-section reveal-section" data-reveal>
        <SectionHeading eyebrow="THE WEDDING DAY" index="03">우리의 결혼식</SectionHeading>
        <p className="date-summary">오후 12시 10분 · 수원 마이어스</p>
        <div className="calendar" aria-label="2026년 10월 달력">
          <div className="calendar-title"><span>10</span><div><strong>OCTOBER</strong><small>2026</small></div></div>
          <div className="calendar-grid week"><b>일</b><b>월</b><b>화</b><b>수</b><b>목</b><b>금</b><b>토</b></div>
          <div className="calendar-grid days">
            {["", "", "", "", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"].map((day, i) => (
              <span className={day === "25" ? "wedding-day" : i % 7 === 0 ? "sunday" : ""} key={`${day}-${i}`}>{day === "25" ? <><b>25</b><small>12:10</small></> : day}</span>
            ))}
          </div>
        </div>
        <div className="dday-card">
          <p>지환과 서희의 결혼식까지</p>
          <strong>{dDay}</strong>
          <span>우리의 새로운 시작을 함께해 주세요.</span>
        </div>
      </section>

      <section className="section gallery-section reveal-section" data-reveal>
        <SectionHeading eyebrow="WEDDING GALLERY" index="04">결혼을 앞둔 우리</SectionHeading>
        <p className="gallery-lead">서로의 평생을 약속하며<br />가장 빛나는 순간을 담았습니다</p>
        <div className="gallery-frame">
          <div className="gallery-track" ref={galleryRef}>
            {GALLERY.map((src, index) => (
              <button type="button" className="gallery-item" key={src} onClick={() => setLightbox(index)} aria-label={`${index + 1}번째 사진 크게 보기`}>
                <img src={src} alt={`지환과 서희의 사진 ${index + 1}`} loading={index < 3 ? "eager" : "lazy"} />
                <span>{String(index + 1).padStart(2, "0")} / {GALLERY.length}</span>
              </button>
            ))}
          </div>
          <button className="gallery-arrow prev" type="button" onClick={() => moveGallery(-1)} aria-label="이전 사진">‹</button>
          <button className="gallery-arrow next" type="button" onClick={() => moveGallery(1)} aria-label="다음 사진">›</button>
        </div>
        <p className="gallery-hint">사진을 누르면 크게 볼 수 있어요</p>
      </section>

      <section className="section location-section reveal-section" data-reveal>
        <SectionHeading eyebrow="LOCATION" index="05">오시는 길</SectionHeading>
        <div className="venue-copy">
          <h3>수원 마이어스</h3>
          <p><strong>그레이스홀</strong><br />경기 수원시 권선구 경수대로 270<br />터미널동 2층</p>
        </div>
        <KakaoMap />
        <div className="map-actions">
          <a href="https://map.kakao.com/link/search/수원%20마이어스" target="_blank" rel="noreferrer">카카오맵</a>
          <a href="https://map.naver.com/p/search/수원%20마이어스" target="_blank" rel="noreferrer">네이버지도</a>
        </div>
      </section>

      <section className="section response-section reveal-section" data-reveal>
        <SectionHeading eyebrow="RSVP & SHUTTLE" index="06">참석 여부를 알려주세요</SectionHeading>
        <p className="response-intro">예식과 전세버스 준비를 위해<br />간단한 응답을 부탁드립니다.</p>
        <div className="response-actions">
          <button type="button" onClick={() => setSurveyLayer("attendance")}>
            <span>WEDDING RSVP</span><strong>결혼식 참석 여부</strong><small>신랑측·신부측별 예상 참석 인원을 파악해요</small><i>응답하기 →</i>
          </button>
          <button type="button" onClick={() => setSurveyLayer("bus")}>
            <span>ANSEONG SHUTTLE</span><strong>안성 전세버스</strong><small>오전 10시 · 한경대학교 산학협력관 주차장</small><i>수요조사 →</i>
          </button>
        </div>
      </section>

      <section className="section account-section reveal-section" data-reveal>
        <SectionHeading eyebrow="FOR YOUR HEART" index="07">마음 전하실 곳</SectionHeading>
        <p className="section-intro">참석이 어려우신 분들을 위해<br />마음 전하실 곳을 안내드립니다.</p>
        {ACCOUNTS.map((group) => (
          <div className={`account-group ${group.tone} ${openAccount === group.side ? "is-open" : ""}`} key={group.side}>
            <button className="account-summary" type="button" aria-expanded={openAccount === group.side} onClick={() => setOpenAccount((current) => current === group.side ? null : group.side)}>
              <span><small>{group.tone === "groom" ? "GROOM'S SIDE" : "BRIDE'S SIDE"}</small>{group.side} 계좌번호</span>
              <i className="account-arrow" aria-hidden="true">⌄</i>
            </button>
            <div className="account-panel" aria-hidden={openAccount !== group.side} inert={openAccount !== group.side ? true : undefined}>
              <div className="account-list">
                {group.people.map((person) => (
                  <div className="account-row" key={person.number}>
                    <div><small>{person.relation}</small><strong>{person.name}</strong><p>{person.bank} {person.number}</p></div>
                    <button type="button" onClick={() => copyAccount(person.number)}>복사</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="section guestbook-section reveal-section" data-reveal>
        <SectionHeading eyebrow="GUESTBOOK" index="08">축하의 마음을 남겨주세요</SectionHeading>
        <p className="guestbook-intro">두 사람의 새로운 시작에<br />따뜻한 한마디를 더해 주세요.</p>
        <form className="guestbook-form" onSubmit={submitGuestbook}>
          <div className="guestbook-form-heading"><span>WRITE A MESSAGE</span><p>남겨주신 마음을 오래도록 간직할게요.</p></div>
          <div className="input-row">
            <label>이름<input name="name" maxLength={20} required placeholder="이름" /></label>
            <label>비밀번호<input name="password" type="password" minLength={4} maxLength={30} required placeholder="숫자 4자리 이상" /></label>
          </div>
          <label>축하 메시지<textarea name="message" maxLength={300} required placeholder="따뜻한 축하의 마음을 남겨주세요." /></label>
          <button className="primary-button guestbook-submit" type="submit"><span>메시지 남기기</span><i aria-hidden="true">→</i></button>
        </form>
        {guestbookStatus && <p className="guestbook-status">{guestbookStatus}</p>}
        <GuestbookList entries={guestbook.slice(0, 4)} />
        {guestbook.length > 4 && <button className="outline-button" type="button" onClick={() => setShowAllGuestbook(true)}>방명록 전체보기 ({guestbook.length})</button>}
      </section>

      <section className="share-section reveal-section" data-reveal aria-label="청첩장 공유">
        <p>소중한 분들께 청첩장을 전해보세요.</p>
        <div className="share-actions"><KakaoShareButton /><LinkCopyButton /></div>
      </section>

      <footer>
        <p>JIHWAHN <span>&amp;</span> SEOHUI</p>
        <small>2026. 10. 25</small>
        <span className="footer-credit">Made by 최지환</span>
      </footer>

      {surveyLayer !== null && (
        <div className="modal survey-layer" role="dialog" aria-modal="true" aria-labelledby="survey-layer-title">
          <button className="survey-layer-backdrop" type="button" onClick={() => setSurveyLayer(null)} aria-label="수요조사 닫기" />
          <div className="survey-sheet">
            <div className="survey-sheet-header">
              <div><span>{surveyLayer === "attendance" ? "WEDDING RSVP" : "ANSEONG SHUTTLE"}</span><h2 id="survey-layer-title">{surveyLayer === "attendance" ? "결혼식 참석 수요조사" : "전세버스 탑승 수요조사"}</h2></div>
              <button type="button" onClick={() => setSurveyLayer(null)} aria-label="닫기">×</button>
            </div>
            <div className="survey-sheet-body">
              {surveyLayer === "attendance" ? (
                <AttendanceSurveyForm onSuccess={() => setSurveyLayer(null)} />
              ) : (
                <BusSurveyForm onSuccess={() => setSurveyLayer(null)} />
              )}
            </div>
          </div>
        </div>
      )}

      {lightbox !== null && (
        <div className="modal lightbox" role="dialog" aria-modal="true" aria-label="사진 크게 보기" onClick={() => setLightbox(null)}>
          <button className="modal-close" type="button" onClick={() => setLightbox(null)} aria-label="닫기">×</button>
          <button className="lightbox-nav lightbox-prev" type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + GALLERY.length) % GALLERY.length); }} aria-label="이전 사진">‹</button>
          <img src={GALLERY[lightbox]} alt={`지환과 서희의 사진 ${lightbox + 1}`} draggable={false} onClick={(e) => e.stopPropagation()} />
          <span>{lightbox + 1} / {GALLERY.length}</span>
          <button className="lightbox-nav lightbox-next" type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % GALLERY.length); }} aria-label="다음 사진">›</button>
        </div>
      )}

      {showAllGuestbook && (
        <div className="modal modal-sheet" role="dialog" aria-modal="true" aria-labelledby="guestbook-modal-title" onClick={() => setShowAllGuestbook(false)}>
          <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header"><h2 id="guestbook-modal-title">축하 메시지</h2><button type="button" onClick={() => setShowAllGuestbook(false)} aria-label="닫기">×</button></div>
            <GuestbookList entries={guestbook} />
          </div>
        </div>
      )}

      {deleteTarget !== null && (
        <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={() => setDeleteTarget(null)}>
          <form onSubmit={deleteGuestbook} onClick={(e) => e.stopPropagation()}>
            <h2 id="delete-title">메시지 삭제</h2><p>작성할 때 입력한 비밀번호를 적어주세요.</p>
            <input name="deletePassword" type="password" required autoFocus placeholder="비밀번호" />
            <div><button type="button" onClick={() => setDeleteTarget(null)}>취소</button><button type="submit">삭제</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
