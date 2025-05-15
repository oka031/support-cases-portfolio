// animations.js 完全版

// スクロールアニメーション
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer の設定
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    // アニメーション対象の要素を観察
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を指定
    const elementsToAnimate = document.querySelectorAll(`
        .value-card,
        .case-card,
        .case-section,
        .result-item,
        .timeline-item
    `);

    elementsToAnimate.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
});

// タイピングアニメーション
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    element.style.borderRight = '2px solid white';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // タイピング完了後、カーソルを点滅させる
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 500);
        }
    }
    type();
}

// Heroセクションのタイピング効果
document.addEventListener('DOMContentLoaded', function() {
    const heroTitle = document.querySelector('.hero h1');
    const heroMessage = document.querySelector('.hero-message');
    const heroSubmessage = document.querySelector('.hero-submessage');
    
    if (heroTitle) {
        // 元のテキストを保存
        const titleText = heroTitle.textContent;
        const messageText = heroMessage.textContent;
        const submessageText = heroSubmessage.textContent;
        
        // 要素を非表示にしてからタイピング開始
        heroMessage.style.opacity = '0';
        heroSubmessage.style.opacity = '0';
        
        // タイトルのタイピング（少し早め）
        typeWriter(heroTitle, titleText, 80);
        
        // メッセージのタイピング（タイトル完了後）
        setTimeout(() => {
            heroMessage.style.opacity = '1';
            typeWriter(heroMessage, messageText, 40);
        }, titleText.length * 80 + 500);
        
        // サブメッセージのタイピング（メッセージ完了後）
        setTimeout(() => {
            heroSubmessage.style.opacity = '1';
            typeWriter(heroSubmessage, submessageText, 30);
        }, titleText.length * 80 + messageText.length * 40 + 1500);
    }
});

// カウントアップアニメーション
function countUp(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const isDecimal = target.toString().includes('.');
    
    function animate() {
        start += increment;
        if (start < target) {
            if (isDecimal) {
                element.textContent = start.toFixed(1);
            } else {
                element.textContent = Math.floor(start);
            }
            requestAnimationFrame(animate);
        } else {
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target;
            }
        }
    }
    animate();
}

// 統計カウントアップの実行
document.addEventListener('DOMContentLoaded', function() {
    // タイピング完了後にカウントアップ開始
    setTimeout(() => {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            countUp(stat, target);
        });
    }, 6000); // タイピング完了後約6秒後に開始
});

// スクロール進捗バー
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    
    if (progressBar) {
        function updateProgressBar() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // 進捗率計算（0-100%）
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            
            // 進捗バーの幅を更新
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        }
        
        // スクロールイベントリスナー
        window.addEventListener('scroll', updateProgressBar);
        
        // 初期化
        updateProgressBar();
    }
});

// 感情変化グラフの実装（完全版・最新）
class EmotionGraph {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.svgWidth = 800;  // 拡大済み
        this.svgHeight = 350; // 拡大済み
        this.padding = 60;    // 拡大済み
        this.isDrawn = false;
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // SVG要素の作成
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', this.svgHeight);
        this.svg.setAttribute('viewBox', `0 0 ${this.svgWidth} ${this.svgHeight}`);
        this.container.appendChild(this.svg);

        // グラデーション定義
        this.createGradient();
        
        // 軸の描画
        this.drawAxes();
        
        // Intersection Observer でアニメーション開始
        this.setupIntersectionObserver();
    }

    createGradient() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // 線のグラデーション（赤→黄→緑）
        const lineGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        lineGradient.setAttribute('id', 'emotionGradient');
        lineGradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        lineGradient.setAttribute('x1', '0%');
        lineGradient.setAttribute('y1', '0%');
        lineGradient.setAttribute('x2', '100%');
        lineGradient.setAttribute('y2', '0%');
        
        const stops = [
            { offset: '0%', color: '#ef4444' },
            { offset: '50%', color: '#fbbf24' },
            { offset: '100%', color: '#10b981' }
        ];
        
        stops.forEach(stop => {
            const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stopElement.setAttribute('offset', stop.offset);
            stopElement.setAttribute('stop-color', stop.color);
            lineGradient.appendChild(stopElement);
        });
        
        defs.appendChild(lineGradient);
        this.svg.appendChild(defs);
    }

    drawAxes() {
        // X軸
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', this.padding);
        xAxis.setAttribute('y1', this.svgHeight - this.padding);
        xAxis.setAttribute('x2', this.svgWidth - this.padding);
        xAxis.setAttribute('y2', this.svgHeight - this.padding);
        xAxis.setAttribute('stroke', '#e5e7eb');
        xAxis.setAttribute('stroke-width', '2');
        this.svg.appendChild(xAxis);

        // Y軸
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', this.padding);
        yAxis.setAttribute('y1', this.padding);
        yAxis.setAttribute('x2', this.padding);
        yAxis.setAttribute('y2', this.svgHeight - this.padding);
        yAxis.setAttribute('stroke', '#e5e7eb');
        yAxis.setAttribute('stroke-width', '2');
        this.svg.appendChild(yAxis);

        // Y軸ラベル（感情レベル）
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', '20');
        yLabel.setAttribute('y', '30');
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('font-size', '14');
        yLabel.setAttribute('fill', '#6b7280');
        yLabel.textContent = '感情レベル';
        this.svg.appendChild(yLabel);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isDrawn) {
                    this.drawGraph();
                    this.isDrawn = true;
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.container);
    }

    drawGraph() {
        const chartWidth = this.svgWidth - 2 * this.padding;
        const chartHeight = this.svgHeight - 2 * this.padding;
        
        // データポイントの計算
        const points = this.data.map((item, index) => {
            const x = this.padding + (chartWidth / (this.data.length - 1)) * index;
            const y = this.svgHeight - this.padding - (item.level / 100) * chartHeight;
            return { x, y, ...item };
        });

        // パスの作成
        const pathData = points.map((point, index) => {
            return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
        }).join(' ');

        // アニメーション用の隠れたパス
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', 'url(#emotionGradient)');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '1000');
        path.setAttribute('stroke-dashoffset', '1000');
        this.svg.appendChild(path);

        // パスアニメーション
        setTimeout(() => {
            path.style.transition = 'stroke-dashoffset 2s ease-out';
            path.style.strokeDashoffset = '0';
        }, 100);

        // ポイントとラベルの描画（遅延）
        points.forEach((point, index) => {
            setTimeout(() => {
                this.drawPoint(point, index);
                this.drawLabel(point, index);
            }, 400 + index * 300);
        });
    }

    drawPoint(point, index) {
        // ポイント描画
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '6');
        circle.setAttribute('fill', this.getColorByLevel(point.level));
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '2');
        circle.style.opacity = '0';
        circle.style.transform = 'scale(0)';
        this.svg.appendChild(circle);

        // ポイントアニメーション
        setTimeout(() => {
            circle.style.transition = 'all 0.4s ease-out';
            circle.style.opacity = '1';
            circle.style.transform = 'scale(1)';
        }, 50);

        // X軸ラベル（段階名）
        const stageLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        stageLabel.setAttribute('x', point.x);
        stageLabel.setAttribute('y', this.svgHeight - 15);
        stageLabel.setAttribute('text-anchor', 'middle');
        stageLabel.setAttribute('font-size', '12');
        stageLabel.setAttribute('fill', '#6b7280');
        stageLabel.textContent = point.stage;
        this.svg.appendChild(stageLabel);
    }

    drawLabel(point, index) {
        // ツールチップ風の情報表示
        const tooltip = document.createElement('div');
        tooltip.className = 'emotion-tooltip';
        tooltip.innerHTML = `
            <div class="emotion-label">
                <strong>${point.emotion}</strong>
                <span class="level">レベル: ${point.level}</span>
            </div>
            <p class="description">${point.description}</p>
        `;
        
        // ポジション計算
        const containerRect = this.container.getBoundingClientRect();
        const svgRect = this.svg.getBoundingClientRect();
        const scale = containerRect.width / this.svgWidth;
        
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${point.x * scale - 100}px`;
        tooltip.style.top = `${point.y * scale - 80}px`;
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
        
        this.container.appendChild(tooltip);

        // ツールチップアニメーション
        setTimeout(() => {
            tooltip.style.transition = 'all 0.3s ease-out';
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        }, 100);
    }

    getColorByLevel(level) {
        if (level <= 30) return '#ef4444';
        if (level <= 60) return '#fbbf24';
        return '#10b981';
    }
}

// 各事例データ定義
const emotionData = {
    'pc-case': [
        { stage: "問題発生", emotion: "困惑", level: 20, description: "PCが急に遅くなり、何をしても改善しない" },
        { stage: "相談", emotion: "希望", level: 40, description: "Okaさんに相談、的確な質問で問題を整理" },
        { stage: "診断", emotion: "理解", level: 60, description: "WiFi問題ではなくドライバー問題と判明" },
        { stage: "解決", emotion: "安心", level: 90, description: "問題解決、今後の予防法も理解" },
        { stage: "完了", emotion: "満足", level: 100, description: "技術的解決＋丁寧な説明で完全理解" }
    ],
    'google-case': [
        { stage: "問題発生", emotion: "不安", level: 15, description: "重要なメールが消えてしまった" },
        { stage: "相談", emotion: "期待", level: 35, description: "Okaさんに状況を詳しく説明" },
        { stage: "調査", emotion: "理解", level: 55, description: "移動とキャンセルの違いを丁寧に説明" },
        { stage: "発見", emotion: "驚き", level: 80, description: "ゴミ箱から無事にメールを発見" },
        { stage: "完了", emotion: "感謝", level: 100, description: "今後同じ問題を避ける方法も習得" }
    ],
    'android-case': [
        { stage: "問題発生", emotion: "困惑", level: 25, description: "スマホの文字入力ができず混乱" },
        { stage: "相談", emotion: "信頼", level: 45, description: "Okaさんが親身に状況を聞いてくれた" },
        { stage: "方針決定", emotion: "納得", level: 65, description: "auショップでの対応が最適と判断" },
        { stage: "橋渡し", emotion: "安心", level: 85, description: "問題を整理してショップスタッフに説明" },
        { stage: "完了", emotion: "満足", level: 100, description: "迅速解決＋的確なサポートに感激" }
    ]
};

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', function() {
    // 現在のページによって適切なデータを使用
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('pc-connection-case') && emotionData['pc-case']) {
        new EmotionGraph('emotion-graph', emotionData['pc-case']);
    } else if (currentPage.includes('google-docs-save-case') && emotionData['google-case']) {
        new EmotionGraph('emotion-graph', emotionData['google-case']);
    } else if (currentPage.includes('android-input-case') && emotionData['android-case']) {
        new EmotionGraph('emotion-graph', emotionData['android-case']);
    }
});

// 円形プログレスバーアニメーション（animations.jsに追加）

// 円形プログレスのアニメーション関数
function animateCircularProgress(circle, targetPercent) {
    const percentElement = circle.querySelector('.skill-percent');
    let currentPercent = 0;
    const increment = targetPercent / 60; // 約1秒で完了
    
    function updateProgress() {
        if (currentPercent < targetPercent) {
            currentPercent += increment;
            if (currentPercent > targetPercent) currentPercent = targetPercent;
            
            // パーセント表示更新
            percentElement.textContent = Math.round(currentPercent) + '%';
            
            // CSS カスタムプロパティで進捗度更新
            const progressDeg = (currentPercent / 100) * 360;
            circle.style.setProperty('--progress-deg', progressDeg + 'deg');
            
            requestAnimationFrame(updateProgress);
        }
    }
    
    updateProgress();
}

// スキルセクションの初期化（animations.jsのDOMContentLoadedに追加）
// スクロール時にスキルプログレスをアニメーション
const skillCircles = document.querySelectorAll('.skill-circle');
if (skillCircles.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target;
                const targetPercent = parseInt(circle.getAttribute('data-percent'));
                
                // 少し遅延させて段階的にアニメーション
                const delay = Array.from(skillCircles).indexOf(circle) * 200;
                setTimeout(() => {
                    animateCircularProgress(circle, targetPercent);
                }, delay);
                
                skillObserver.unobserve(circle);
            }
        });
    }, { threshold: 0.5 });

    skillCircles.forEach(circle => {
        // 初期状態設定
        circle.style.setProperty('--progress-deg', '0deg');
        skillObserver.observe(circle);
    });
}

// パーティクル背景システム（animations.jsに追加）

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        
        // レスポンシブ対応
        this.particleCount = window.innerWidth < 768 ? 30 : 80;
        
        this.init();
        this.createParticles();
        this.animate();
        this.bindEvents();
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }
    
    bindEvents() {
        // マウス追従効果
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // パーティクル数調整
            const newCount = window.innerWidth < 768 ? 30 : 80;
            if (newCount !== this.particleCount) {
                this.particleCount = newCount;
                this.particles = [];
                this.createParticles();
            }
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パーティクル更新・描画
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });
        
        // パーティクル間の接続線
        this.drawConnections();
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        this.particles.forEach((a, i) => {
            this.particles.slice(i + 1).forEach(b => {
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.stroke();
                }
            });
        });
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    
    update(mouse) {
        // 基本移動
        this.x += this.speedX;
        this.y += this.speedY;
        
        // 境界で反射
        if (this.x < 0 || this.x > this.canvasWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > this.canvasHeight) this.speedY *= -1;
        
        // マウス引力効果
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const force = (100 - distance) / 100;
            this.x += dx * force * 0.03;
            this.y += dy * force * 0.03;
        }
        
        // サイズ変動効果
        this.size += Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.01;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 輝き効果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }
}

// DOMContentLoadedでパーティクルシステム初期化
document.addEventListener('DOMContentLoaded', function() {
    // 既存の初期化コードの後に追加
    
    // パーティクル背景初期化（Hero Sectionがある場合のみ）
    if (document.getElementById('hero-particles')) {
        new ParticleSystem('hero-particles');
    }
});