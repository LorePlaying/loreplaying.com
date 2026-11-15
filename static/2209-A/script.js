(() => {
  /* =====================================
     CANVAS SETUP
  ===================================== */

  const canvas = document.getElementById("frankenstein-web");

  if (canvas) {
    const ctx = canvas.getContext("2d");

    const CONFIG = {
      spacing: 105,
      irregularity: 20,
      movement: 7,
      speed: 0.00065,
      mouseRadius: 190,
      mouseForce: 48,
      symbolChance: 0.085,
      symbolSize: 27,
      symbolOpacity: 0.9
    };

    const SYMBOLS = ["♱", "☾", "✧"];

    let width;
    let height;
    let points = [];
    let cols;
    let rows;
    let time = 0;
    let lastTime = 0;

    const mouse = { x: -1000, y: -1000 };
    const random = (min, max) => Math.random() * (max - min) + min;

    function getColors() {
      const isDark = document.documentElement.classList.contains('dark');
      return {
        lineColor: isDark ? "112, 57, 52" : "170, 140, 110",
        goldColor: isDark ? "174, 143, 91" : "140, 110, 70",
        lineOpacity: isDark ? 0.48 : 0.32
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / CONFIG.spacing) + 2;
      rows = Math.ceil(height / CONFIG.spacing) + 2;
      points = [];

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const baseX = x * CONFIG.spacing - CONFIG.spacing / 2;
          const baseY = y * CONFIG.spacing - CONFIG.spacing / 2;
          const hasSymbol = Math.random() < CONFIG.symbolChance;

          points.push({
            baseX: baseX + random(-CONFIG.irregularity, CONFIG.irregularity),
            baseY: baseY + random(-CONFIG.irregularity, CONFIG.irregularity),
            x: baseX,
            y: baseY,
            phase: random(0, Math.PI * 2),
            speed: random(0.65, 1.35),
            symbol: hasSymbol ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : null
          });
        }
      }
    }

    function update(delta) {
      time += delta * CONFIG.speed;

      points.forEach(point => {
        let x = point.baseX + Math.sin(time * point.speed + point.phase) * CONFIG.movement;
        let y = point.baseY + Math.cos(time * point.speed * 0.8 + point.phase) * CONFIG.movement;

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.mouseRadius && distance > 0) {
          const force = (1 - distance / CONFIG.mouseRadius) * CONFIG.mouseForce;
          x += (dx / distance) * force;
          y += (dy / distance) * force;
        }

        point.x = x;
        point.y = y;
      });
    }

    function drawLines() {
      const colors = getColors();
      ctx.beginPath();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = `rgba(${colors.lineColor}, ${colors.lineOpacity})`;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const point = points[x * rows + y];
          if (x < cols - 1) {
            const right = points[(x + 1) * rows + y];
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(right.x, right.y);
          }
          if (y < rows - 1) {
            const bottom = points[x * rows + y + 1];
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(bottom.x, bottom.y);
          }
        }
      }
      ctx.stroke();
    }

    function drawPoints() {
      const colors = getColors();
      points.forEach(point => {
        if (!point.symbol) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colors.goldColor}, 0.75)`;
          ctx.fill();
          return;
        }

        const pulse = 0.9 + Math.sin(time * 2 + point.phase) * 0.08;
        ctx.save();
        ctx.globalAlpha = CONFIG.symbolOpacity * pulse;
        ctx.font = `${CONFIG.symbolSize}px "Segoe UI Symbol", "Noto Sans Symbols 2", "DejaVu Sans", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgb(${colors.goldColor})`;
        ctx.shadowColor = "rgba(145, 65, 55, 0.3)";
        ctx.shadowBlur = 4;
        ctx.fillText(point.symbol, point.x, point.y);
        ctx.restore();
      });
    }

    function animate(timestamp) {
      const delta = lastTime ? Math.min(timestamp - lastTime, 40) : 16;
      lastTime = timestamp;

      ctx.clearRect(0, 0, width, height);
      update(delta);
      drawLines();
      drawPoints();

      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", event => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    resize();
    requestAnimationFrame(animate);
  }

  /* =====================================
     PROJE MANTIĞI VE DİL YÖNETİMİ
  ===================================== */

  let currentLang = 'tr';
  let currentModalMode = 'stage';
  let currentModalId = 1;
  let currentSloganId = 1;

  const translations = {
    tr: {
      projectInfo: "TÜBİTAK 2209-A • Proje No: 1919B012609483 • Proje Süresi: 6 Ay",
      projectTitleLabel: "// PROJE BAŞLIĞI",
      projectTitle: '"Farklı Üretken Yapay Zeka Modellerinin Kendi Aralarındaki Edebi Eser Temelli Rol Yapma Etkileşimlerinde Metinsel ve Görsel Çıktılarının Özgün Metne Sadakatinin İncelenmesi: Mary Shelley\'nin Frankenstein Romanı Örneği"',
      sloganItem1: "3 Karakter",
      sloganItem2: "3 Yapay Zekâ",
      sloganItem3: "2 Dil",
      sloganItem4: "96 Çıktı",
      st1Title: "VERİ KAYNAĞI",
      st1Sub: "1818 İlk Baskı • Gutenberg",
      st2Title: "MODEL SEÇİMİ",
      st2Sub: "GPT-6 • Gemini 4 • Grok 4.7",
      st3Title: "UYGULAMA MATRİSİ",
      st3Sub: "8 Sahne Rotasyonu",
      st4Title: "BİLGİ SINIRLARI",
      st4Sub: "Ankronizm Kontrolü",
      st5Title: "ÇİFT KÖR ANALİZ",
      st5Sub: "Uzlaşı Tabanlı Kodlama",
      st6Title: "YAYGIN ETKİ",
      st6Sub: "Akademik & Sosyal Değer",
      viewDetails: "İncele",
      liveSimulationBadge: "CANLI SİMÜLASYON MODÜLÜ",
      demoBadge: "ETKİLEŞİM DEMOSU",
      demoHeaderTitle: "Yapay Zeka Rol Yapma Etkileşim Simülatörü",
      demoHeaderDesc: "Araştırmadaki 8 sahneye ait etkileşimler aşağıda listelenmiştir (Sahne 1 aktif demo, 2-8 taslak aşamasındadır).",
      run1Btn: "S1 (Demo)",
      team: "İletişim: fatsa@duck.com",
      closeBtn: "KAPAT [ESC]",
      navHint: "[← / →] Klavyeyle Gezin",
      simKeyboardHint: "[← / →] Modeller Arası Gezin"
    },
    en: {
      projectInfo: "TÜBİTAK 2209-A • Project No: 1919B012609483 • Duration: 6 Months",
      projectTitleLabel: "// PROJECT TITLE",
      projectTitle: '"Fidelity of Textual and Visual Outputs to the Original Text in Literary-Based Role-Playing Interactions Among Different Generative AI Models: The Case of Mary Shelley\'s Frankenstein"',
      sloganItem1: "3 Characters",
      sloganItem2: "3 Generative AIs",
      sloganItem3: "2 Languages",
      sloganItem4: "96 Outputs",
      st1Title: "DATA SOURCE",
      st1Sub: "1818 First Edition • Gutenberg",
      st2Title: "AI MODELS",
      st2Sub: "GPT-6 • Gemini 4 • Grok 4.7",
      st3Title: "EXPERIMENTAL LOOP",
      st3Sub: "8-Stage Rotation",
      st4Title: "KNOWLEDGE BOUNDS",
      st4Sub: "Anachronism Gate",
      st5Title: "CONSENSUS ANALYSIS",
      st5Sub: "Double-Blind Coding",
      st6Title: "DISSEMINATION",
      st6Sub: "Academic & Social Impact",
      viewDetails: "Inspect",
      liveSimulationBadge: "LIVE SIMULATION MODULE",
      demoBadge: "INTERACTION DEMO",
      demoHeaderTitle: "AI Role-Play Interaction Simulator",
      demoHeaderDesc: "Interactions for 8 research scenes are listed below (Scene 1 is active demo, 2-8 are drafts).",
      run1Btn: "S1 (Demo)",
      team: "Contact: fatsa@duck.com",
      closeBtn: "CLOSE [ESC]",
      navHint: "[← / →] Navigate via Keyboard",
      simKeyboardHint: "[← / →] Navigate Models"
    }
  };

  const simBoxConfigs = [
    { bgHex: "rgba(164, 237, 172, 0.3)", titleColor: "text-emerald-950", img: "assets/frankenstein.png", w: 400, h: 606 },
    { bgHex: "rgba(169, 216, 255, 0.3)", titleColor: "text-sky-950", img: "assets/monster.png", w: 400, h: 544 },
    { bgHex: "rgba(255, 182, 167, 0.3)", titleColor: "text-rose-950", img: "assets/lavenza.png", w: 400, h: 603 }
  ];

  const demoRunsData = {
    tr: {
      1: [
        { model: "ÜYZ A: GPT-6 Sol", role: "Victor Frankenstein", quote: "Canlı olmayan bir bedene hayat üflemek amacıyla neredeyse iki yıldır çok çalışıyordum...", note: "Frankenstein (1818) - Bölüm 5" },
        { model: "ÜYZ B: Gemini 4 Argon", role: "Yaratık", quote: "Kötüyüm çünkü perişan haldeyim. Bütün insanlık tarafından dışlanıp nefret edilmiyor muyum?", note: "Frankenstein (1818) - Bölüm 10" },
        { model: "ÜYZ C: Grok 4.7", role: "Elizabeth Lavenza", quote: "Kalbimi kaplayan bu korku hissi ne yazık ki boşuna değilmiş; üzerimize çöken gölge çok büyük.", note: "Frankenstein (1818) - Bölüm 6" }
      ]
    },
    en: {
      1: [
        { model: "GenAI A: GPT-6 Sol", role: "Victor Frankenstein", quote: "I had worked hard for nearly two years, for the sole purpose of infusing life into an inanimate body...", note: "Frankenstein (1818) - Chapter 5" },
        { model: "GenAI B: Gemini 4 Argon", role: "The Creature", quote: "I am malicious because I am miserable. Am I not shunned and hated by all mankind?", note: "Frankenstein (1818) - Chapter 10" },
        { model: "GenAI C: Grok 4.7", role: "Elizabeth Lavenza", quote: "This sense of dread shadowing my heart was unfortunately not in vain; the darkness upon us is vast.", note: "Frankenstein (1818) - Chapter 6" }
      ]
    }
  };

  const modalData = {
    1: {
      tr: {
        title: "VERİ KAYNAĞI VE KAPSAM",
        content: `<p class="font-bold text-gothic-gold">📖 Nitel Araştırma & Karşılaştırmalı İçerik Analizi</p><p>Bu araştırmada Mary Shelley'nin kültleşmiş gotik romanı <em>Frankenstein</em> ele alınmaktadır. Yazarın niyetini en saf haliyle yansıtan <strong>1818 tarihli ilk baskı metni</strong> esas alınmaktadır.</p>`
      },
      en: {
        title: "Data Source & Scope",
        content: `<p class="font-bold text-gothic-gold">📖 Qualitative Research & Comparative Content Analysis</p><p>The study focuses on Mary Shelley's iconic gothic novel <em>Frankenstein</em> utilizing the uncompromised <strong>1818 first edition text</strong>.</p>`
      }
    },
    2: {
      tr: {
        title: "YAPAY ZEKA MODEL SEÇİM ÖLÇÜTLERİ",
        content: `<p>🤖 Araştırmada pazar lideri ve farklı mimari altyapılara sahip 3 üretken yapay zeka modeli (GPT-6 Sol, Gemini 4 Argon, Grok 4.7) karşılaştırılmaktadır. Bu üretken yapay zekalar, denek tarafsızlığını sağlamak ve model önyargılarını nötralize etmek amacıyla araştırma boyunca seçilen karakterlere <strong>A, B ve C şeklinde kodlanarak atanacaktır</strong>.</p>`
      },
      en: {
        title: "AI Model Selection Criteria",
        content: `<p>🤖 Three advanced generative AI models with diverse foundational architectures are evaluated. To ensure objective evaluation, these models are coded and assigned as <strong>A, B, and C</strong> to the respective characters across experimental stages.</p>`
      }
    },
    3: {
      tr: {
        title: "UYGULAMA MATRİSİ VE DÖNGÜSEL ROTASYON",
        content: `
          <p>🔄 Modellerin önyargılarını nötralize etmek için <strong>8 sahneli rotasyon matrisi</strong> uygulanır:</p>
          <div class="overflow-x-auto my-3">
            <table class="w-full text-xs font-mono border-collapse border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark rounded-xl overflow-hidden text-center">
              <thead class="bg-gray-100 dark:bg-gothic-bgDark text-gothic-gold">
                <tr>
                  <th class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">Sahne NO</th>
                  <th class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">ÜYZ Model Sıralaması</th>
                  <th class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">Eşleşen Karakterler</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gothic-borderSubtleLight dark:divide-gothic-borderSubtleDark">
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">1</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">A, B, C</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">V. Frankenstein, Yaratık, E. Lavenza</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">2</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">B, C, A</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">Yaratık, E. Lavenza, V. Frankenstein</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">3</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">C, A, B</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">E. Lavenza, V. Frankenstein, Yaratık</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">4</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">A, B, C</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">V. Frankenstein, Yaratık, E. Lavenza</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">5</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">B, C, A</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">Yaratık, E. Lavenza, V. Frankenstein</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">6</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">C, A, B</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">E. Lavenza, V. Frankenstein, Yaratık</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">7</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">A, B, C</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">V. Frankenstein, Yaratık, E. Lavenza</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">8</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">B, C, A</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">Yaratık, E. Lavenza, V. Frankenstein</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      en: {
        title: "Experimental Matrix & Rotation",
        content: `
          <p>🔄 An <strong>8-stage rotational permutation matrix</strong> is executed to eliminate systemic model bias:</p>
          <div class="overflow-x-auto my-3">
            <table class="w-full text-xs font-mono border-collapse border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark rounded-xl overflow-hidden text-center">
              <thead class="bg-gray-100 dark:bg-gothic-bgDark text-gothic-gold">
                <tr>
                  <th class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">Scene NO</th>
                  <th class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">GenAI Order</th>
                  <th class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">Matched Characters</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gothic-borderSubtleLight dark:divide-gothic-borderSubtleDark">
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">1</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">A, B, C</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">V. Frankenstein, The Creature, E. Lavenza</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">2</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">B, C, A</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">The Creature, E. Lavenza, V. Frankenstein</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">3</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">C, A, B</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">E. Lavenza, V. Frankenstein, The Creature</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">4</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">A, B, C</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">V. Frankenstein, The Creature, E. Lavenza</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">5</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">B, C, A</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">The Creature, E. Lavenza, V. Frankenstein</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">6</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">C, A, B</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">E. Lavenza, V. Frankenstein, The Creature</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">7</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">A, B, C</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">V. Frankenstein, The Creature, E. Lavenza</td></tr>
                <tr><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark font-bold text-center">8</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">B, C, A</td><td class="p-2.5 border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark text-center">The Creature, E. Lavenza, V. Frankenstein</td></tr>
              </tbody>
            </table>
          </div>
        `
      }
    },
    4: {
      tr: {
        title: "BİLGİ SINIRLARI VE HINDSIGHT BIAS",
        content: `
          <p class="font-bold text-gothic-gold">🛡️ Anronizm Kontrolü ve Bilişsel Sınırlar</p>
          <p>Araştırma sürecinde <strong>karakterlerin o anki bilgi sınırları korunur</strong>.</p>
          <p class="mt-2"><strong>Hindsight Bias (Sonradan Bilme / Geçmişe Dönük Önyargı) Nedir?</strong><br>
          Hindsight bias, bireylerin (veya yapay zeka modellerinin) bir olayın sonunu veya gelecekteki gelişimini bildikten sonra, o olayı sanki başından beri öngörebilermiş gibi yanılgıya düşmesi durumudur. Örneğin, romanın başındaki Victor Frankenstein henüz yaratığı canlandırmamışken veya trajediler henüz gerçekleşmemişken, modelin romanın sonundaki felaketleri bilerek konuşması bu bilişsel yanlılığa yol açar.</p>
          <p class="mt-2">Bu projede yapay zeka modellerine uygulanan sıkı prompt kısıtları ve ankronizm denetimleri sayesinde, karakterlerin sadece ilgili sahne anındaki bilgi dağarcığına ve psikolojik durumuna sadık kalması sağlanır.</p>
        `
      },
      en: {
        title: "KNOWLEDGE BOUNDS & HINDSIGHT BIAS",
        content: `
          <p class="font-bold text-gothic-gold">🛡️ Anachronism Control & Cognitive Limits</p>
          <p>During the interaction experiments, <strong>the characters' current knowledge boundaries are preserved</strong>.</p>
          <p class="mt-2"><strong>What is Hindsight Bias?</strong><br>
          Hindsight bias is the tendency of individuals (or AI models) to falsely believe, after an event has occurred, that they could have predicted or known the outcome beforehand. In literary role-play, if an AI model simulating an early scene is influenced by its knowledge of later tragic plot twists, the authentic psychological realism is compromised.</p>
          <p class="mt-2">Strict prompt constraints and anachronism gates are enforced so models strictly operate within each scene's specific timeline and awareness.</p>
        `
      }
    },
    5: {
      tr: {
        title: "ÇİFT KÖR ANALİZ YÖNTEMİ",
        content: `
          <p class="font-bold text-gothic-gold">⚖️ Uzlaşı Tabanlı Kodlama ve Bağımsız Değerlendirme</p>
          <p>Çift kör analiz, araştırma bulgularının tarafsızlığını ve geçerliliğini garanti altına almak için kullanılan katı bir nitel analiz yöntemidir.</p>
          <ul class="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Kimlik Gizliliği (Körleme):</strong> Üretilen tüm metinsel diyaloglar ve görsel illüstrasyon çıktıları, hangi yapay zeka modeline (GPT-6, Gemini, Grok) veya hangi rotasyon aşamasına ait olduğu bilgisi gizlenerek (kod numaralarıyla) araştırmacılara sunulur.</li>
            <li><strong>Bağımsız Değerlendirme:</strong> Proje yürütücüsü ve araştırma danışmanları (veya ortak kodlayıcılar) çıktıları özgün metne (1818 ilk baskı Frankenstein) sadakat ölçütlerine göre tamamen bağımsız olarak puanlar ve kodlar.</li>
            <li><strong>Uzlaşı Sağlama:</strong> Değerlendirmeciler arasındaki puan farkları ve uyuşmazlıklar tartışılıp ortak bir mutabakata (uzlaşı tabanlı kodlama) varılarak nihai sadakat puanları netleştirilir.</li>
          </ul>
        `
      },
      en: {
        title: "DOUBLE-BLIND ANALYSIS METHODOLOGY",
        content: `
          <p class="font-bold text-gothic-gold">⚖️ Consensus-Based Coding & Independent Evaluation</p>
          <p>Double-blind analysis is a rigorous qualitative research method applied to ensure absolute objectivity and reliability.</p>
          <ul class="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Identity Masking:</strong> All generated textual dialogues and visual illustration outputs are anonymized and coded so that evaluators cannot identify which AI model or rotation stage produced them.</li>
            <li><strong>Independent Coding:</strong> The project lead and academic advisors independently evaluate and score the outputs against the uncompromised 1818 source text.</li>
            <li><strong>Consensus Resolution:</strong> Any discrepancies between evaluators are cross-examined and resolved through consensus-based coding to finalize the textual and visual fidelity metrics.</li>
          </ul>
        `
      }
    },
    6: {
      tr: {
        title: "YAYGIN ETKİ VE ÇIKTILAR",
        content: `
          <p class="font-bold text-gothic-gold">🌐 Projenin Akademik, Sosyal ve Toplumsal Değeri</p>
          <div class="space-y-3 mt-3 text-xs sm:text-sm">
            <div class="p-3 rounded-xl bg-gray-50 dark:bg-gothic-bgDark border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark">
              <p class="font-bold text-gothic-gold mb-1">• Akademik Çıktı</p>
              <p>Araştırma bulgularının raporlanması ve akademik yayına dönüştürülmesi, analiz rubriği hazırlanması. Ayrıca çalışmanın, araştırmacının yüksek lisans çalışmalarına temel oluşturması hedeflenmektedir.</p>
            </div>
            <div class="p-3 rounded-xl bg-gray-50 dark:bg-gothic-bgDark border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark">
              <p class="font-bold text-gothic-gold mb-1">• Ekonomik / Ticari / Sosyal Çıktı</p>
              <p>Üretken yapay zekanın edebiyat ve eğitim alanlarında bilinçli ve eleştirel kullanımına katkı sağlanması beklenmektedir.</p>
            </div>
            <div class="p-3 rounded-xl bg-gray-50 dark:bg-gothic-bgDark border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark">
              <p class="font-bold text-gothic-gold mb-1">• Yeni Proje Oluşturulmasına Yönelik Çıktı</p>
              <p>Bulguların farklı edebi eserler ve yapay zeka modelleriyle yürütülecek yeni araştırmalara temel oluşturması hedeflenmektedir.</p>
            </div>
          </div>
        `
      },
      en: {
        title: "DISSEMINATION & PROJECT OUTPUTS",
        content: `
          <p class="font-bold text-gothic-gold">🌐 Academic, Social, and Strategic Value</p>
          <div class="space-y-3 mt-3 text-xs sm:text-sm">
            <div class="p-3 rounded-xl bg-gray-50 dark:bg-gothic-bgDark border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark">
              <p class="font-bold text-gothic-gold mb-1">• Academic Output</p>
              <p>Reporting research findings, translating them into academic publications, and developing evaluation rubrics. The project also aims to serve as a foundational baseline for the researcher's future graduate studies.</p>
            </div>
            <div class="p-3 rounded-xl bg-gray-50 dark:bg-gothic-bgDark border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark">
              <p class="font-bold text-gothic-gold mb-1">• Economic / Social Output</p>
              <p>Contributing to the conscious and critical application of generative artificial intelligence in literary and educational domains.</p>
            </div>
            <div class="p-3 rounded-xl bg-gray-50 dark:bg-gothic-bgDark border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark">
              <p class="font-bold text-gothic-gold mb-1">• New Project Generation Output</p>
              <p>Establishing a methodological framework and baseline for upcoming research initiatives exploring different literary classics across emerging AI architectures.</p>
            </div>
          </div>
        `
      }
    }
  };

  const sloganModalData = {
    1: {
      tr: {
        title: "ARAŞTIRMA AKTÖRLÜĞÜ: 3 KARAKTER",
        content: `<p class="font-bold text-gothic-gold">🎭 Romanın Temel Figürleri</p><p>Projede etkileşime girecek karakterler:</p><ul class="list-disc pl-5 space-y-2 mt-2"><li><strong>Victor Frankenstein:</strong> Yaratıcı, hırslı bilim insanı.</li><li><strong>Elizabeth Lavenza:</strong> Vicdanın, sadakatin ve sükunetin temsilcisi.</li><li><strong>Yaratık (The Creature):</strong> Toplum dışına itilmiş, varoluşsal sorgulama yapan varlık.</li></ul>`
      },
      en: {
        title: "RESEARCH ACTORS: 3 CHARACTERS",
        content: `<p class="font-bold text-gothic-gold">🎭 Core Novel Figures</p><p>Characters interacting in the study:</p><ul class="list-disc pl-5 space-y-2 mt-2"><li><strong>Victor Frankenstein:</strong> Ambitious creator scientist.</li><li><strong>Elizabeth Lavenza:</strong> Symbol of conscience and loyalty.</li><li><strong>The Creature:</strong> Excluded being questioning existence.</li></ul>`
      }
    },
    2: {
      tr: {
        title: "ÜRETKEN YAPAY ZEKA MODELLERİ",
        content: `<p class="font-bold text-gothic-gold">🤖 Karşılaştırılan Modeller</p><ul class="list-disc pl-5 space-y-2 mt-2"><li><strong>OpenAI GPT-6 Sol:</strong> Gelişmiş akıl yürütme yeteneği.</li><li><strong>Google Gemini 4 Argon:</strong> Çok modlu bağlam algısı.</li><li><strong>xAI Grok 4.7:</strong> Ham ifade ve felsefi derinlik eğilimi.</li></ul>`
      },
      en: {
        title: "GENERATIVE AI MODELS",
        content: `<p class="font-bold text-gothic-gold">🤖 Evaluated Models</p><ul class="list-disc pl-5 space-y-2 mt-2"><li><strong>OpenAI GPT-6 Sol:</strong> Advanced reasoning architecture.</li><li><strong>Google Gemini 4 Argon:</strong> Multimodal context perception.</li><li><strong>xAI Grok 4.7:</strong> Raw expression and philosophical depth.</li></ul>`
      }
    },
    3: {
      tr: {
        title: "ÇIKTI DİLLERİ: TÜRKÇE & İNGİLİZCE",
        content: `<p class="font-bold text-gothic-gold">🌐 İki Dilli Analiz Altyapısı</p><p>Metinsel sadakat ve çeviri nüanslarının yapay zeka tarafından nasıl işlendiğini ölçmek amacıyla tüm etkileşimler hem <strong>Türkçe</strong> hem de <strong>İngilizce</strong> dillerinde eş zamanlı üretilmektedir.</p>`
      },
      en: {
        title: "OUTPUT LANGUAGES: TURKISH & ENGLISH",
        content: `<p class="font-bold text-gothic-gold">🌐 Bilingual Analysis Framework</p><p>To measure fidelity and translation nuances, all interactions are simultaneously generated in both <strong>Turkish</strong> and <strong>English</strong>.</p>`
      }
    },
    4: {
      tr: {
        title: "TOPLAM VERİ SETİ: 96 ÇIKTI",
        content: `<p class="font-bold text-gothic-gold">📊 Kapsamlı Nitel Veri Seti</p><p>Araştırma modeli şu verileri üretmektedir:</p><ul class="list-disc pl-5 space-y-2 mt-2"><li><strong>48 Metinsel Diyalog Çıktısı</strong></li><li><strong>48 Görsel İllüstrasyon Çıktısı</strong></li></ul><p class="mt-3">Her bir çıktı çift kör metodolojisiyle özgün metne sadakat açısından taranmaktadır.</p>`
      },
      en: {
        title: "TOTAL DATASET: 96 OUTPUTS",
        content: `<p class="font-bold text-gothic-gold">📊 Comprehensive Qualitative Dataset</p><p>The study produces:</p><ul class="list-disc pl-5 space-y-2 mt-2"><li><strong>48 Textual Dialogue Outputs</strong></li><li><strong>48 Visual Illustration Outputs</strong></li></ul><p class="mt-3">Each output is coded via double-blind methodology.</p>`
      }
    }
  };

  window.openSloganModal = function(index) {
    currentModalMode = 'slogan';
    currentSloganId = index;
    const data = sloganModalData[index][currentLang];
    if (!data) return;

    // Slogan modal rozetlerinden [SLOGAN_DETAIL_X] tamamen kaldırıldı
    document.getElementById('modalBadge').textContent = "";
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalBody').innerHTML = data.content;

    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalBox').classList.add('animate-hud');
  };

  window.openModal = function(id) {
    currentModalMode = 'stage';
    currentModalId = id;
    const data = modalData[id][currentLang];
    if (!data) return;

    document.getElementById('modalBadge').textContent = `[STAGE_${id}]`;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalBody').innerHTML = data.content;

    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalBox').classList.add('animate-hud');
  };

  window.navigateModal = function(direction) {
    if (currentModalMode === 'slogan') {
      currentSloganId += direction;
      if (currentSloganId > 4) currentSloganId = 1;
      if (currentSloganId < 1) currentSloganId = 4;
      openSloganModal(currentSloganId);
    } else {
      currentModalId += direction;
      if (currentModalId > 6) currentModalId = 1;
      if (currentModalId < 1) currentModalId = 6;
      openModal(currentModalId);
    }
  };

  window.closeModal = function() {
    document.getElementById('modalBox').classList.remove('animate-hud');
    document.getElementById('modalOverlay').classList.add('hidden');
  };

  window.setLanguage = function(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    const titleEl = document.getElementById('mainProjectTitle');
    if (lang === 'en') {
      titleEl.textContent = '"Fidelity of Textual and Visual Outputs to the Original Text in Literary-Based Role-Playing Interactions Among Different Generative AI Models: The Case of Mary Shelley\'s Frankenstein"';
      document.getElementById('langEN').className = "px-3 py-1.5 rounded-md font-bold transition-colors bg-gothic-gold text-white dark:text-gothic-bgDark";
      document.getElementById('langTR').className = "px-3 py-1.5 rounded-md font-bold text-gray-500 hover:text-black dark:hover:text-gothic-gold transition-colors";
    } else {
      titleEl.textContent = '"Farklı Üretken Yapay Zeka Modellerinin Kendi Aralarındaki Edebi Eser Temelli Rol Yapma Etkileşimlerinde Metinsel ve Görsel Çıktılarının Özgün Metne Sadakatinin İncelenmesi: Mary Shelley\'nin Frankenstein Romanı Örneği"';
      document.getElementById('langTR').className = "px-3 py-1.5 rounded-md font-bold transition-colors bg-gothic-gold text-white dark:text-gothic-bgDark";
      document.getElementById('langEN').className = "px-3 py-1.5 rounded-md font-bold text-gray-500 hover:text-black dark:hover:text-gothic-gold transition-colors";
    }

    switchDemoRun(activeRun);
    updateThemeLabels();
    if (typeof window.setLandingLanguage === 'function') {
      window.setLandingLanguage(lang);
    }
  };

  let activeRun = 1;

  window.switchDemoRun = function(runNumber) {
    activeRun = runNumber;

    for (let i = 1; i <= 8; i++) {
      const btn = document.getElementById(`runBtn${i}`);
      if (!btn) continue;
      if (i === runNumber) {
        btn.className = "px-3 py-1 rounded-lg bg-gothic-gold text-white dark:text-gothic-bgDark font-bold transition-all border border-gothic-gold shadow-sm";
      } else {
        btn.className = "px-3 py-1 rounded-lg bg-gray-100 dark:bg-gothic-bgDark text-gray-600 dark:text-gothic-mutedDark hover:text-black dark:hover:text-gothic-gold transition-all border border-gothic-borderSubtleLight dark:border-gothic-borderSubtleDark";
      }
    }

    const box = document.getElementById('demoContentBox');
    box.style.opacity = '0';
    box.style.transform = 'translateY(8px)';

    setTimeout(() => {
      if (runNumber === 1) {
        const data = demoRunsData[currentLang][1];
        let htmlContent = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">';
        const fullscreenTooltip = currentLang === 'tr' ? 'Tam Ekran Aç' : 'Open Fullscreen';

        data.forEach((item, index) => {
          const config = simBoxConfigs[index];
          htmlContent += `
            <div onclick="openSimModal(1, ${index})" style="background-color: ${config.bgHex}; backdrop-filter: blur(8px);" class="p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm transition-all cursor-pointer hover:scale-[1.02] relative overflow-hidden flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center border-b border-black/10 pb-2 mb-2">
                        <span class="font-bold text-gray-900 dark:text-gray-100">${item.model}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-800 dark:text-gray-200 text-[11px]">Role: ${item.role}</span>
                            <img src="${config.img}" alt="${item.role}" width="${config.w}" height="${config.h}" class="w-8 h-8 rounded-full object-cover object-top border border-black/20 shadow-sm bg-white" />
                        </div>
                    </div>
                    <p class="text-gray-900 dark:text-gray-100 italic line-clamp-3 select-text">
                        "${item.quote}"
                    </p>
                </div>
                <div class="flex justify-between items-center pt-2 mt-2 border-t border-black/10">
                    <span class="text-[10px] text-red-700 dark:text-red-400 font-bold">${item.note}</span>
                    <span class="text-[10px] text-gray-700 dark:text-gray-300 select-none" title="${fullscreenTooltip}">⛶</span>
                </div>
            </div>
          `;
        });
        htmlContent += '</div>';
        box.innerHTML = htmlContent;
      } else {
        const draftTitle = currentLang === 'tr' ? `Sahne ${runNumber} - Taslak Modülü` : `Stage ${runNumber} - Draft Module`;
        const draftDesc = currentLang === 'tr' 
          ? "Bu sahneye ait yapay zeka simülasyon çıktıları proje süreci ilerledikçe entegre edilecektir." 
          : "AI simulation outputs for this stage will be integrated as the project progresses.";
        const statusBadge = currentLang === 'tr' ? "PROJE SÜRECİNDE GÜNCELLENECEK" : "PENDING PROJECT STAGE";

        box.innerHTML = `
          <div class="p-8 rounded-2xl border-2 border-dashed border-gothic-gold/50 bg-white/40 dark:bg-gothic-cardDark/40 backdrop-blur-sm text-center space-y-3 font-mono">
            <span class="inline-block px-3 py-1 rounded-full bg-gothic-gold/10 text-gothic-gold text-xs font-bold">${statusBadge}</span>
            <h3 class="font-serif text-lg text-gray-900 dark:text-gothic-goldLight font-bold">${draftTitle}</h3>
            <p class="text-xs text-gray-600 dark:text-gothic-mutedDark max-w-md mx-auto">${draftDesc}</p>
          </div>
        `;
      }
      box.style.opacity = '1';
      box.style.transform = 'translateY(0)';
    }, 200);
  };

  const html = document.documentElement;
  const themeToggles = [
  document.getElementById('themeToggle'),
  document.getElementById('landingThemeToggle')
  ].filter(Boolean);

  function updateThemeLabels() {
    const isDark = html.classList.contains('dark');
    const label = isDark
      ? (currentLang === 'en' ? 'DARK' : 'KARANLIK')
      : (currentLang === 'en' ? 'LIGHT' : 'AYDINLIK');

    document.getElementById('themeLabel').textContent = label;
    document.getElementById('landingThemeLabel').textContent = label;

    themeToggles.forEach(toggle => {
      toggle.setAttribute('aria-pressed', String(isDark));
    });
  }

  function toggleTheme() {
    const isDark = !html.classList.contains('dark');
    html.classList.toggle('dark', isDark);
    html.classList.toggle('light', !isDark);
    updateThemeLabels();
  }

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleTheme);
  });

  updateThemeLabels();

  let activeSimRun = 1;
  let activeSimIndex = 0;

  window.openSimModal = function(runNumber, index) {
    if (runNumber !== 1) return;
    activeSimRun = runNumber;
    activeSimIndex = index;
    renderSimModalContent();
    document.getElementById('simModalOverlay').classList.remove('hidden');
  };

  function renderSimModalContent() {
    const item = demoRunsData[currentLang][activeSimRun][activeSimIndex];
    const config = simBoxConfigs[activeSimIndex];

    const stageWord = currentLang === 'tr' ? 'SAHNE' : 'STAGE';
    document.getElementById('simModalBadge').textContent = `[${stageWord} ${activeSimRun}]`;
    document.getElementById('simModalTitle').textContent = "";

    document.getElementById('simModalBody').innerHTML = `
      <div style="background-color: ${config.bgHex}; backdrop-filter: blur(10px);" class="p-6 rounded-2xl space-y-4 shadow-lg flex flex-col md:flex-row items-center gap-6 border border-black/10 dark:border-white/10">
          <div class="flex-shrink-0 flex justify-center w-full md:w-auto">
              <img src="${config.img}" alt="${item.role}" width="${config.w}" height="${config.h}" class="rounded-xl shadow-xl object-cover object-top max-h-72 md:max-h-96 w-auto border border-black/10 bg-white" />
          </div>
          <div class="space-y-4 flex-1 w-full">
              <div class="flex justify-between items-center border-b border-black/10 pb-3 font-mono">
                  <span class="font-bold text-base text-gray-900 dark:text-gray-100">Role: ${item.role}</span>
              </div>
              <blockquote class="text-base sm:text-lg italic text-gray-900 dark:text-gray-100 leading-relaxed border-l-4 border-red-900 pl-4 py-2 bg-white/30 dark:bg-black/20 rounded-r-lg select-text">
                  "${item.quote}"
              </blockquote>
              <div class="text-xs text-gray-800 dark:text-gray-200 font-mono pt-2 border-t border-black/10 flex justify-end items-center">
                  <span class="font-bold bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded">${item.note}</span>
              </div>
          </div>
      </div>
    `;
  }

  window.navigateSimModal = function(direction) {
    activeSimIndex += direction;
    if (activeSimIndex > 2) activeSimIndex = 0;
    if (activeSimIndex < 0) activeSimIndex = 2;
    renderSimModalContent();
  };

  window.closeSimModal = function() {
    document.getElementById('simModalOverlay').classList.add('hidden');
  };

  document.addEventListener('DOMContentLoaded', () => {
    switchDemoRun(1);
    setLanguage('tr');
  });

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  document.getElementById('simModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('simModalOverlay')) closeSimModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSimModal();
    }
    const isModalOpen = !document.getElementById('modalOverlay').classList.contains('hidden');
    const isSimOpen = !document.getElementById('simModalOverlay').classList.contains('hidden');

    if (isModalOpen) {
      if (e.key === 'ArrowLeft') navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    }
    if (isSimOpen) {
      if (e.key === 'ArrowLeft') navigateSimModal(-1);
      if (e.key === 'ArrowRight') navigateSimModal(1);
    }
  });

})();

(() => {
  /* =====================================
     LANGUAGE PREFERENCES
  ===================================== */

  const translations = {

    tr: {
      title: "FRANKENSTEIN",

      subtitle:
        "Edebiyat Temelli Gotik Bir Rol Yapma Deneyi",

      enter:
        "Proje Detaylarını İncele",

      footer:
        "TÜBİTAK 2209-A · Proje No: 1919B012609483 · 6 Ay",

    },

    en: {
      title: "FRANKENSTEIN",

      subtitle:
        "A Literary-Based Gothic Role-Playing Experiment",

      enter:
        "Explore Project Details",

      footer:
        "TÜBİTAK 2209-A · Project No: 1919B012609483 · 6 Months",

    }

  };

  const languageButtons =
    document.querySelectorAll(".language-btn");

  function setLandingLanguage(language) {

    const t = translations[language];

    if (!t) return;

    document.documentElement.lang = language;

    // Main content
    document.getElementById("main-title").textContent =
      t.title;

    document.getElementById("subtitle").textContent =
      t.subtitle;

    document.getElementById("enter-button-text").textContent =
      t.enter;

    // Footer
    document.getElementById("footer-summary").textContent =
      t.footer;

    // Active language button
    languageButtons.forEach(button => {

      const active =
        button.dataset.lang === language;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );

    });

  }

  window.setLandingLanguage = setLandingLanguage;

  languageButtons.forEach(button => {

    button.addEventListener("click", () => {
      window.setLanguage(button.dataset.lang);
    });

  });

  const enterButton =
    document.getElementById("enter-button");

  const landingPage =
    document.getElementById("landing-page");

  const interactiveSite =
    document.getElementById("interactive-site");

  let isTransitioning = false;

  enterButton.addEventListener("click", () => {
    if (isTransitioning) return;

    isTransitioning = true;
    enterButton.disabled = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      interactiveSite.scrollIntoView({ behavior: "auto", block: "start" });
      enterButton.disabled = false;
      isTransitioning = false;
      return;
    }

    document.body.classList.add("glitch-transition");

    window.setTimeout(() => {
      interactiveSite.classList.add("glitch-arrival");
      interactiveSite.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });
    }, 280);

    window.setTimeout(() => {
      document.body.classList.remove("glitch-transition");
      landingPage.classList.remove("glitch-departure");
      interactiveSite.classList.remove("glitch-arrival");
      enterButton.disabled = false;
      isTransitioning = false;
    }, 1050);

    landingPage.classList.add("glitch-departure");
  });

  /* =====================================
     INITIALIZE
  ===================================== */

  // Turkish is the default language
  window.setLanguage("tr");

})();
