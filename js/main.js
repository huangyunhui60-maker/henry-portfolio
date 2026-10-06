/* ============================================
   Henry · 个人网站交互逻辑
   纯原生 JS，无依赖
   ============================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------
     1. 背景粒子 + 连线（Canvas）
     -------------------------------------------- */
  function initCanvas() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var w = 0;
    var h = 0;
    var rafId = null;
    var mouse = { x: -9999, y: -9999 };

    var COLORS = ['34, 211, 238', '168, 85, 247', '232, 121, 249'];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function buildParticles() {
      // 密度随面积变化，但设上限保证性能
      var count = Math.min(Math.round((w * h) / 16000), 90);
      count = Math.max(count, 26);
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.6 + 0.5,
          c: COLORS[(Math.random() * COLORS.length) | 0]
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // 粒子移动
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.c + ', 0.75)';
        ctx.fill();
      }

      // 连线
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist2 = dx * dx + dy * dy;
          if (dist2 < 16900) { // 130px 内
            var alpha = (1 - Math.sqrt(dist2) / 130) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = 'rgba(150, 120, 240, ' + alpha + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // 靠近鼠标的粒子被轻轻吸引
      for (var m = 0; m < particles.length; m++) {
        var q = particles[m];
        var mdx = mouse.x - q.x;
        var mdy = mouse.y - q.y;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < 24000 && md2 > 1) {
          var f = 0.02 / Math.sqrt(md2);
          q.vx += mdx * f;
          q.vy += mdy * f;
        }
        // 限速
        var sp = Math.hypot(q.vx, q.vy);
        if (sp > 0.9) {
          q.vx = (q.vx / sp) * 0.9;
          q.vy = (q.vy / sp) * 0.9;
        }
        // 轻微阻尼，避免越跑越快
        q.vx *= 0.999;
        q.vy *= 0.999;
      }

      rafId = requestAnimationFrame(step);
    }

    resize();
    step();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    // 页面不可见时暂停，省电
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        step();
      }
    });

    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mouseout', function () {
        mouse.x = -9999;
        mouse.y = -9999;
      });
    }
  }

  /* --------------------------------------------
     2. 导航：滚动状态 + 移动端菜单
     -------------------------------------------- */
  function initNav() {
    var nav = document.getElementById('nav');
    var burger = document.getElementById('burger');
    var links = document.querySelector('.nav__links');

    function onScroll() {
      if (!nav) return;
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (burger && links && nav) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        nav.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
      });

      // 点击链接后收起菜单
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          links.classList.remove('is-open');
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });

      // 点击外部收起
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && links.classList.contains('is-open')) {
          links.classList.remove('is-open');
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* --------------------------------------------
     3. 首屏打字机
     -------------------------------------------- */
  function initTyped() {
    var el = document.getElementById('typed');
    if (!el) return;

    var phrases = [
      '把技术翻译成体验',
      '让 AI 安静地解决问题',
      '用数据说话，用结果收尾',
      '偶尔也自己写点代码'
    ];

    if (reduceMotion) {
      el.textContent = phrases[0];
      return;
    }

    var pi = 0;
    var ci = 0;
    var deleting = false;

    function tick() {
      var current = phrases[pi];
      if (!deleting) {
        ci++;
        el.textContent = current.slice(0, ci);
        if (ci === current.length) {
          deleting = true;
          return setTimeout(tick, 1700);
        }
        return setTimeout(tick, 72 + Math.random() * 55);
      }
      ci--;
      el.textContent = current.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        return setTimeout(tick, 320);
      }
      setTimeout(tick, 34);
    }

    setTimeout(tick, 600);
  }

  /* --------------------------------------------
     4. 数字滚动
     -------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutExpo
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* --------------------------------------------
     5. 滚动进场（IntersectionObserver）
     -------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('is-in'); });
      initSkillBars();
      initCounters();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        // 同组元素做一点错峰延迟，观感更自然
        var siblings = el.parentElement
          ? Array.prototype.filter.call(el.parentElement.children, function (c) {
              return c.classList.contains('reveal');
            })
          : [];
        var idx = siblings.indexOf(el);
        var delay = idx > 0 ? Math.min(idx * 75, 380) : 0;

        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });

    Array.prototype.forEach.call(els, function (el) { io.observe(el); });

    initSkillBars();
    initCounters();
  }

  /* 观察某个元素，进入视口后执行一次 */
  function onceInView(target, threshold, cb) {
    if (!target) { cb(); return; }
    if (reduceMotion || !('IntersectionObserver' in window)) { cb(); return; }

    var o = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          cb();
          o.disconnect();
        }
      });
    }, { threshold: threshold });

    o.observe(target);
  }

  function initSkillBars() {
    var bars = document.querySelectorAll('.bar');
    if (!bars.length) return;

    onceInView(document.getElementById('skills'), 0.25, function () {
      Array.prototype.forEach.call(bars, function (bar, i) {
        var level = bar.getAttribute('data-level') || '0';
        var fillEl = bar.querySelector('.bar__fill');
        if (!fillEl) return;
        setTimeout(function () {
          fillEl.style.width = level + '%';
        }, reduceMotion ? 0 : i * 130);
      });
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    onceInView(document.querySelector('.hero__stats'), 0.3, function () {
      Array.prototype.forEach.call(counters, function (el, i) {
        setTimeout(function () { animateCount(el); }, reduceMotion ? 0 : i * 120);
      });
    });
  }

  /* --------------------------------------------
     6. 项目卡片展开 / 收起
     -------------------------------------------- */
  function initProjects() {
    var grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.project__toggle');
      if (!btn) return;
      var card = btn.closest('.project');
      if (!card) return;

      var open = card.classList.toggle('is-open');
      var label = open ? '收起详情' : '展开详情';
      // 保留末尾的图标元素，只替换文本节点
      btn.childNodes[0].nodeValue = label + ' ';
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  /* --------------------------------------------
     7. Toast 提示
     -------------------------------------------- */
  var toastTimer;
  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-show');
    }, 2200);
  }

  /* --------------------------------------------
     8. 复制邮箱 + 小彩蛋
     -------------------------------------------- */
  function initExtras() {
    var copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = copyBtn.getAttribute('data-copy') || '';
        var done = function () {
          showToast('邮箱已复制 ✅ 期待你的来信');
        };
        var fail = function () {
          showToast('复制失败，手动来吧：' + text);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            legacyCopy(text) ? done() : fail();
          });
        } else {
          legacyCopy(text) ? done() : fail();
        }
      });
    }

    var eggBtn = document.getElementById('egg-btn');
    var eggFace = document.getElementById('egg-face');
    var eggLabel = document.getElementById('egg-label');
    if (eggBtn && eggFace && eggLabel) {
      var jokes = [
        'AI 不会取代你，会用 AI 的人可能会 🙂',
        'Prompt 写得再好，也救不了需求没想清楚 🤡',
        '别问模型行不行，先问数据有没有 🗂️',
        'Demo 惊艳和产品好用，中间隔着一整个团队 🛠️',
        '上线不是终点，是用户开始骂你的起点 😌',
        '最好的 AI 功能，是用户没意识到那是 AI ✨'
      ];
      var faces = ['🙂', '😄', '🤓', '😎', '🫡', '🤖'];
      var idx = 0;

      eggBtn.addEventListener('click', function () {
        showToast(jokes[idx % jokes.length]);
        eggFace.textContent = faces[idx % faces.length];
        idx++;
        if (idx >= jokes.length) {
          eggLabel.textContent = '再来一次';
        } else {
          eggLabel.textContent = '点我 (' + (jokes.length - idx) + ')';
        }
      });
    }

    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      return false;
    }
  }

  /* --------------------------------------------
     8b. Dify 聊天助手：用页面按钮唤起气泡
     -------------------------------------------- */
  function initChatLauncher() {
    var btn = document.getElementById('chat-launch');
    if (!btn) return;

    function openChat() {
      var bubble = document.getElementById('dify-chatbot-bubble-button');
      if (!bubble) return false;
      bubble.click();
      return true;
    }

    btn.addEventListener('click', function () {
      if (openChat()) return;

      // 助手脚本是 defer 加载的，可能还没就绪 —— 短暂重试
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        if (openChat()) {
          clearInterval(timer);
          return;
        }
        if (tries >= 8) {
          clearInterval(timer);
          showToast('AI 助手没能加载出来，先邮件找我吧 ✉️');
        }
      }, 400);
    });
  }

  /* --------------------------------------------
     9. 平滑锚点跳转（考虑固定导航高度）
     -------------------------------------------- */
  function initSmoothAnchors() {
    if (reduceMotion) return;

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      var navH = 70;
      var top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });

      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* --------------------------------------------
     启动
     -------------------------------------------- */
  function boot() {
    initCanvas();
    initNav();
    initTyped();
    initReveal();
    initProjects();
    initExtras();
    initChatLauncher();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
