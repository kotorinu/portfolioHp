/* ============================================================
   Tonari AI — local-first chat experience
   Works from a downloaded ZIP. Uses window.claude when available,
   otherwise falls back to lightweight local answers.
   ============================================================ */
(function () {
  "use strict";

  var log = document.getElementById("chatLog");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var sendBtn = document.getElementById("chatSend");
  if (!log || !form || !input || !sendBtn) return;

  var CONTACT = "kotokoto.gaisya@gmail.com";
  var history = [];
  var busy = false;

  var SYSTEM = [
    "あなたはTonari AIの紹介チャットボットです。",
    "小さなお店・個人事業主向けに、AIチャットボット制作、HP/LP制作、業務効率化、AI導入相談、オーダーメイド開発を案内します。",
    "運営者はフロントエンドエンジニアで、使いやすい画面づくりとWebの仕組みづくりを強みにしています。",
    "専門用語を避け、2〜4文でやさしく回答してください。",
    "初回相談と見積りは無料です。制作費は内容に合わせた個別見積りとして案内してください。",
    "問い合わせはページ下部のフォーム、または " + CONTACT + " へのメールで受け付けます。",
    "フォームとメールはいつでも送信できます。確認しやすい時間は平日夜と土日です。電話番号は案内しないでください。"
  ].join("\n");

  function avatarBot() {
    return '<span class="msg-ava bot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/></svg></span>';
  }

  function avatarMe() {
    return '<span class="msg-ava me" aria-hidden="true">You</span>';
  }

  function addMessage(role, text) {
    var row = document.createElement("div");
    row.className = "msg-row " + (role === "user" ? "user" : "bot");
    var bubble = document.createElement("div");
    bubble.className = "msg";
    bubble.innerHTML = (role === "user" ? avatarMe() : avatarBot()) + '<div class="bubble"></div>';
    bubble.querySelector(".bubble").textContent = text;
    row.appendChild(bubble);
    log.appendChild(row);
    scrollDown();
  }

  function addTyping() {
    var row = document.createElement("div");
    row.className = "msg-row bot";
    row.id = "typingRow";
    row.innerHTML = avatarBot() + '<div class="msg"><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>';
    log.appendChild(row);
    scrollDown();
  }

  function removeTyping() {
    var t = document.getElementById("typingRow");
    if (t) t.remove();
  }

  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
    input.disabled = state;
  }

  function localReply(text) {
    var q = text.toLowerCase();
    if (/予約|飲食|問い合わせ|faq|ボット|bot|チャット/.test(q)) {
      return "はい、予約やよくある質問の一次対応ボットを作れます。営業時間、メニュー、予約条件などを整理して、サイトに置ける形でご提案します。まずは無料相談で、今の対応内容を一緒に確認しましょう。";
    }
    if (/知識|初心者|苦手|わから|不安|ai/.test(q)) {
      return "知識ゼロでも大丈夫です。専門用語をなるべく使わず、何にAIを使うと効果が出そうかを一緒に整理します。小さく試せる形から始められます。";
    }
    if (/流れ|期間|納期|進め|導入/.test(q)) {
      return "流れは、ご相談、ヒアリング、ご提案、制作、納品後サポートの順です。シンプルな内容なら数日から2週間ほどが目安ですが、内容に合わせて無理のない進め方をご提案します。";
    }
    if (/費用|料金|価格|見積|いくら/.test(q)) {
      return "初回相談とお見積りは無料です。チャットボット制作、HP/LP制作、業務効率化サポートなどは内容に合わせた個別見積りになります。必要な範囲だけに絞ってご提案しますので、ページ下部のフォームから気軽にご相談ください。";
    }
    if (/hp|lp|サイト|ホームページ|seo/.test(q)) {
      return "HP/LP制作も対応できます。スマホで見やすく、問い合わせにつながる導線やSEOの基本設定まで含めて整えます。AIチャットボットとの組み合わせも可能です。";
    }
    if (/営業時間|受付時間|何時|いつ.*連絡|連絡.*いつ|電話|電話番号|tel/.test(q)) {
      return "フォームとメールはいつでも送っていただいて大丈夫です。確認しやすいのは平日夜と土日なので、その時間帯は比較的お返事しやすいです。電話番号は掲載していないため、ページ下部のフォームまたは " + CONTACT + " へご連絡ください。";
    }
    if (/メール|連絡|相談|問い合わせ|申し込み/.test(q)) {
      return "ご相談は無料です。ページ下部のフォーム、または " + CONTACT + " へメールでご連絡ください。フォームとメールはいつでも送信できますし、やりたいことがまだ曖昧でもそのまま送っていただいて大丈夫です。";
    }
    return "Tonari AIでは、AIチャットボット制作、業務効率化、HP/LP制作、AI導入相談をサポートしています。今のお困りごとを一言で送っていただければ、合いそうな進め方をお伝えします。";
  }

  async function askClaude(text) {
    var claude = window["claude"];
    if (!claude || typeof claude.complete !== "function") return null;
    history.push({ role: "user", content: text });
    var reply = await claude.complete({ system: SYSTEM, messages: history });
    reply = (reply || "").trim()
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/(^|\n)\s*[-*]\s+/g, "$1・");
    if (reply) history.push({ role: "assistant", content: reply });
    return reply;
  }

  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    addMessage("user", text);
    input.value = "";
    setBusy(true);
    addTyping();

    window.setTimeout(async function () {
      var reply = null;
      try {
        reply = await askClaude(text);
      } catch (e) {
        reply = null;
      }
      removeTyping();
      addMessage("assistant", reply || localReply(text));
      setBusy(false);
      input.focus();
    }, 350);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value);
  });

  document.querySelectorAll(".sample-q").forEach(function (button) {
    button.addEventListener("click", function () {
      send(button.getAttribute("data-q"));
    });
  });

  addMessage(
    "assistant",
    "こんにちは！Tonari AI のアシスタントです。チャットボット制作、業務効率化、HP/LP制作など、気になることをそのまま聞いてください。"
  );
})();
