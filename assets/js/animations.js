// animations.js 完全版（クリック式感情グラフ対応）

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

    // タイピングアニメーション（修正版）を最後に実行
    const typingElements = document.querySelectorAll('.typing-effect');
    typingElements.forEach((element, index) => {
        const typewriter = new TypewriterEffect(element, {
            speed: 30,
            delay: index * 1000
        });
        typewriter.start();
    });
});

// HTMLタグ対応タイピングアニメーション
class TypewriterEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.originalHTML = element.innerHTML;
        this.speed = options.speed || 50;
        this.delay = options.delay || 0;
        this.currentIndex = 0;
        this.currentHTML = '';
        
        // HTMLタグを解析して文字とタグのリストを作成
        this.parseHTML();
    }
    
    parseHTML() {
        this.tokens = [];
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.originalHTML;
        
        this.processNode(tempDiv);
    }
    
    processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // テキストノードの場合、一文字ずつ配列に追加
            const text = node.textContent;
            for (let char of text) {
                this.tokens.push({ type: 'char', content: char });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 要素ノードの場合、開始タグを追加
            const tagName = node.tagName.toLowerCase();
            const attributes = this.getAttributesString(node);
            this.tokens.push({ 
                type: 'openTag', 
                content: `<${tagName}${attributes}>` 
            });
            
            // 子ノードを再帰的に処理
            for (let child of node.childNodes) {
                this.processNode(child);
            }
            
            // 終了タグを追加
            this.tokens.push({ 
                type: 'closeTag', 
                content: `</${tagName}>` 
            });
        }
    }
    
    getAttributesString(element) {
        let attrs = '';
        for (let attr of element.attributes) {
            attrs += ` ${attr.name}="${attr.value}"`;
        }
        return attrs;
    }
    
    start() {
        // 最初に要素を非表示にする
        this.element.style.opacity = '0';
        
        setTimeout(() => {
            this.element.innerHTML = '';
            this.element.style.opacity = '1';
            this.element.classList.add('typing-active');
            this.typeNext();
        }, this.delay);
    }
    
    typeNext() {
        if (this.currentIndex < this.tokens.length) {
            const token = this.tokens[this.currentIndex];
            
            if (token.type === 'char') {
                // 文字の場合、一文字ずつ表示
                this.currentHTML += token.content;
                this.element.innerHTML = this.currentHTML;
                this.currentIndex++;
                setTimeout(() => this.typeNext(), this.speed);
            } else {
                // タグの場合、一気に追加（表示はされない）
                this.currentHTML += token.content;
                this.element.innerHTML = this.currentHTML;
                this.currentIndex++;
                // タグは即座に次へ
                this.typeNext();
            }
        }
    }
}

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

// クリック式感情グラフクラス
class EmotionGraph {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.svgWidth = 800;
        this.svgHeight = 350;
        this.padding = 60;
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('グラフコンテナが見つかりません');
            return;
        }
        
        // SVG作成
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', this.svgHeight);
        this.svg.setAttribute('viewBox', `0 0 ${this.svgWidth} ${this.svgHeight}`);
        this.container.appendChild(this.svg);

        // 軸の描画
        this.drawAxes();
        
        // Intersection Observer でアニメーション開始
        this.setupIntersectionObserver();
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

        // Y軸ラベル
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
                if (entry.isIntersecting) {
                    console.log('グラフの描画開始');
                    this.drawGraph();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.container);
    }

    drawGraph() {
        const chartWidth = this.svgWidth - 2 * this.padding;
        const chartHeight = this.svgHeight - 2 * this.padding;
        
        // ポイントの計算
        const points = this.data.map((item, index) => {
            const x = this.padding + (chartWidth / (this.data.length - 1)) * index;
            const y = this.svgHeight - this.padding - (item.level / 100) * chartHeight;
            return { x, y, ...item };
        });

        // 線の描画（アニメーション付き）
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = points.map((point, index) => {
            return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
        }).join(' ');
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#4A90A4');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-dasharray', '1000');
        path.setAttribute('stroke-dashoffset', '1000');
        this.svg.appendChild(path);

        // 線のアニメーション
        setTimeout(() => {
            path.style.transition = 'stroke-dashoffset 2s ease-out';
            path.style.strokeDashoffset = '0';
        }, 100);

        // ポイントとクリック領域を描画（遅延）
        points.forEach((point, index) => {
            setTimeout(() => {
                this.drawPoint(point, index);
                this.drawClickZone(point, index);
                this.drawLabel(point, index);
            }, 400 + index * 300);
        });

        // 初期表示（最初のカード）
        setTimeout(() => {
            this.showCard(0);
        }, 2000);
    }

    drawPoint(point, index) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', this.getColorByLevel(point.level));
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '3');
        circle.style.cursor = 'pointer';
        circle.style.opacity = '0';
        circle.style.transform = 'scale(0)';
        this.svg.appendChild(circle);

        // ポイントアニメーション
        setTimeout(() => {
            circle.style.transition = 'all 0.4s ease-out';
            circle.style.opacity = '1';
            circle.style.transform = 'scale(1)';
        }, 50);
    }

    drawClickZone(point, index) {
        const zoneWidth = (this.svgWidth - 2 * this.padding) / this.data.length;
        const zone = document.createElement('div');
        zone.className = 'emotion-click-zone';
        
        const leftPercent = ((this.padding + index * zoneWidth) / this.svgWidth) * 100;
        const widthPercent = (zoneWidth / this.svgWidth) * 100;
        
        zone.style.left = `${leftPercent}%`;
        zone.style.width = `${widthPercent}%`;
        
        zone.addEventListener('click', () => {
            this.showCard(index);
            console.log(`${point.emotion}: ${point.stage}`);
        });
        
        this.container.appendChild(zone);
    }

    drawLabel(point, index) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', point.x);
        label.setAttribute('y', this.svgHeight - 15);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', '#6b7280');
        label.textContent = point.stage;
        this.svg.appendChild(label);
    }

    getColorByLevel(level) {
        if (level <= 30) return '#ef4444';
        if (level <= 60) return '#fbbf24';
        return '#10b981';
    }

    showCard(index) {
        const cardsContainer = document.getElementById('emotionCards');
        const data = this.data[index];
        
        cardsContainer.innerHTML = `
            <div class="emotion-card animate">
                <h3>${data.stage}</h3>
                <div class="emotion-level ${data.levelClass}">レベル ${data.level}</div>
                <div class="emotion-title">${data.title}</div>
                <div class="emotion-description">${data.description}</div>
            </div>
        `;

        // アニメーション適用
        setTimeout(() => {
            const card = cardsContainer.querySelector('.emotion-card');
            if (card) {
                card.classList.add('show');
            }
        }, 100);
    }
}

// 各事例データ定義
const emotionData = {
    'pc-case': [
        { 
            stage: "問題発生", 
            emotion: "困惑", 
            level: 20, 
            levelClass: "low",
            title: "混乱と不安",
            description: "PCが急に遅くなり、何をしても改善しない。WiFi接続済みなのにインターネットに繋がらず、<br>どこから手をつければよいかわからない状態。"
        },
        { 
            stage: "相談", 
            emotion: "希望", 
            level: 40, 
            levelClass: "medium",
            title: "希望の光",
            description: "Okaさんに相談できることで少し安心感を得る。的確な質問で問題を整理してもらい、<br>解決への道筋が見え始める。"
        },
        { 
            stage: "診断", 
            emotion: "理解", 
            level: 60, 
            levelClass: "medium",
            title: "理解と納得",
            description: "WiFi問題ではなくドライバー問題と判明。問題の原因が明確になり、<br>専門的な診断により納得感と安心感が大幅に向上。"
        },
        { 
            stage: "解決", 
            emotion: "安心", 
            level: 90, 
            levelClass: "high",
            title: "達成感と安心",
            description: "問題が解決され、大きな達成感を感じる。今後の予防法も理解でき、同様の問題への対応力も身についた。"
        },
        { 
            stage: "完了", 
            emotion: "満足", 
            level: 100, 
            levelClass: "high",
            title: "満足と感謝",
            description: "技術的解決に加えて丁寧な説明で完全理解。<br>プロセス全体を振り返り、専門家への感謝と自分自身の成長を実感。"
        }
    ],
    'google-case': [
        { 
            stage: "問題発生", 
            emotion: "不安", 
            level: 15, 
            levelClass: "low",
            title: "パニックと焦り",
            description: "重要なメールが消えてしまい、どこを探しても見つからない。仕事に支障が出る可能性があり、強い焦りと不安を感じる。"
        },
        { 
            stage: "相談", 
            emotion: "期待", 
            level: 35, 
            levelClass: "medium",
            title: "希望の芽生え",
            description: "Okaさんに状況を詳しく説明。親身に聞いてもらい、解決への期待感が生まれる。適切な質問で状況を整理してもらう。"
        },
        { 
            stage: "調査", 
            emotion: "理解", 
            level: 55, 
            levelClass: "medium",
            title: "構造理解",
            description: "メールの移動とキャンセルの違いを丁寧に説明してもらい、Gmailの仕組みへの理解が深まる。問題の構造が見えてくる。"
        },
        { 
            stage: "発見", 
            emotion: "驚き", 
            level: 80, 
            levelClass: "high",
            title: "安堵と驚き",
            description: "ゴミ箱から無事にメールを発見。消えたと思っていたメールが実は残っていたことに安堵感と驚きを感じる。"
        },
        { 
            stage: "完了", 
            emotion: "感謝", 
            level: 100, 
            levelClass: "high",
            title: "深い感謝",
            description: "メール復旧に加えて今後同じ問題を避ける方法も習得。専門的なサポートへの深い感謝と自信の向上を実感。"
        }
    ],
    'android-case': [
        { 
            stage: "問題発生", 
            emotion: "困惑", 
            level: 25, 
            levelClass: "low",
            title: "混乱状態",
            description: "スマートフォンの文字入力ができなくなり、どこを触ったのかも分からない状態。日常生活に支障をきたす不安で混乱。"
        },
        { 
            stage: "相談", 
            emotion: "信頼", 
            level: 45, 
            levelClass: "medium",
            title: "信頼の始まり",
            description: "Okaさんが親身に状況を聞いてくれ、技術的な問題にも関わらず丁寧に対応してもらえることに信頼感を抱く。"
        },
        { 
            stage: "方針決定", 
            emotion: "納得", 
            level: 65, 
            levelClass: "medium",
            title: "方向性の確信",
            description: "auショップでの対応が最適という判断に納得。問題の性質を理解し、適切な解決方法が見つかったことで安心感が増す。"
        },
        { 
            stage: "橋渡し", 
            emotion: "安心", 
            level: 85, 
            levelClass: "high",
            title: "手厚いサポート",
            description: "問題を整理してショップスタッフに説明してもらい、スムーズな解決への道筋ができたことで大きな安心感を得る。"
        },
        { 
            stage: "完了", 
            emotion: "満足", 
            level: 100, 
            levelClass: "high",
            title: "完全解決",
            description: "迅速な解決に加えて、最適なサポート体制への橋渡しまでしてもらい、総合的なサポートの質に深い満足を感じる。"
        }
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

// 円形プログレスバーアニメーション
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

// スキルセクションの初期化
document.addEventListener('DOMContentLoaded', function() {
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
});

// パーティクル背景システム
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
    // パーティクル背景初期化（Hero Sectionがある場合のみ）
    if (document.getElementById('hero-particles')) {
        new ParticleSystem('hero-particles');
    }
});