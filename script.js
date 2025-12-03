// 天蓝色博客 JavaScript 交互功能

// 移动端导航菜单切换
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // 点击导航链接时关闭菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});

// 标签页切换功能
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 移除所有按钮的活跃状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // 添加当前按钮的活跃状态
        this.classList.add('active');

        // 这里可以添加筛选文章的逻辑
        const category = this.textContent;
        console.log('切换到分类:', category);

        // 模拟筛选效果
        filterPostsByCategory(category);
    });
});

// 筛选文章功能
function filterPostsByCategory(category) {
    const blogCards = document.querySelectorAll('.blog-card');
    const categoryMap = {
        '全部': ['技术', '生活', '设计'],
        '技术': ['技术'],
        '生活': ['生活'],
        '设计': ['设计']
    };

    const categoriesToShow = categoryMap[category] || [];

    blogCards.forEach(card => {
        const categoryTag = card.querySelector('.category-tag');
        const cardCategory = categoryTag.textContent;

        if (categoriesToShow.includes(cardCategory)) {
            card.style.display = 'block';
            // 添加淡入动画
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.display = 'none';
        }
    });
}

// 搜索功能
const searchInput = document.getElementById('searchInput');
const searchButtons = document.querySelectorAll('.search-btn, .search-btn-sidebar');

searchButtons.forEach(button => {
    button.addEventListener('click', performSearch);
    button.addEventListener('click', function() {
        // 添加点击动画效果
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        console.log('搜索:', searchTerm);
        // 这里可以实现实际的搜索逻辑
        highlightSearchResults(searchTerm);
    }
}

// 高亮搜索结果
function highlightSearchResults(searchTerm) {
    const blogCards = document.querySelectorAll('.blog-card');

    blogCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const excerpt = card.querySelector('.excerpt').textContent.toLowerCase();

        if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
            card.style.border = '2px solid #42a5f5';
            card.style.boxShadow = '0 0 20px rgba(66, 165, 245, 0.3)';
        } else {
            card.style.border = '1px solid #e3f2fd';
            card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        }
    });
}

// 阅读更多按钮功能
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('read-more')) {
        e.preventDefault();

        const card = e.target.closest('.blog-card');
        const title = card.querySelector('h4').textContent;

        // 添加点击动画
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 100);

        // 模拟跳转到文章详情页
        console.log('阅读文章:', title);
        showArticleNotification(title);
    }
});

// 显示文章通知
function showArticleNotification(title) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'article-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span>正在加载文章: ${title}</span>
            <button class="close-notification">&times;</button>
        </div>
    `;

    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // 添加关闭按钮功能
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });

    // 3秒后自动消失
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }
    }, 3000);
}

// 分页功能
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('page-btn')) {
        // 移除所有按钮的活跃状态
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 添加当前按钮的活跃状态
        e.target.classList.add('active');

        const page = e.target.textContent;
        console.log('翻页到:', page);

        // 添加翻页动画
        const blogGrid = document.querySelector('.blog-grid');
        blogGrid.style.opacity = '0.5';

        setTimeout(() => {
            blogGrid.style.opacity = '1';
            loadPageContent(page);
        }, 300);
    }
});

// 加载页面内容
function loadPageContent(page) {
    console.log('加载第', page, '页内容');
    // 这里可以实现实际的页面加载逻辑
}

// 订阅功能
const subscribeBtn = document.querySelector('.subscribe-btn');
const newsletterInput = document.getElementById('newsletter');

if (subscribeBtn && newsletterInput) {
    subscribeBtn.addEventListener('click', function() {
        const email = newsletterInput.value.trim();

        if (email && isValidEmail(email)) {
            // 添加动画效果
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;

            // 模拟订阅过程
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> 已订阅';
                newsletterInput.value = '';

                // 显示成功消息
                showNotification('订阅成功！感谢您的关注。', 'success');

                // 恢复按钮状态
                setTimeout(() => {
                    this.innerHTML = '订阅';
                    this.disabled = false;
                }, 2000);
            }, 1500);
        } else {
            showNotification('请输入有效的邮箱地址', 'error');
        }
    });
}

// 邮箱验证
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 通用通知函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        </div>
    `;

    // 根据类型设置不同的颜色
    const colors = {
        success: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
        error: 'linear-gradient(135deg, #ef5350 0%, #f44336 100%)',
        info: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // 添加关闭按钮功能
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });

    // 3秒后自动消失
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }
    }, 3000);
}

// 社交链接点击效果
document.addEventListener('click', function(e) {
    if (e.target.closest('.social-link') || e.target.closest('.social-icon')) {
        e.preventDefault();
        const icon = e.target.closest('a');
        const platform = icon.querySelector('i').className;

        // 添加点击动画
        icon.style.transform = 'scale(0.8)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 150);

        console.log('点击社交链接:', platform);
        showNotification('正在跳转到社交媒体页面...', 'info');
    }
});

// 滚动时的导航栏效果
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'linear-gradient(135deg, rgba(129, 212, 250, 0.95) 0%, rgba(79, 195, 247, 0.95) 100%)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'linear-gradient(135deg, #81d4fa 0%, #4fc3f7 100%)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// 页面加载完成后的初始化
window.addEventListener('load', function() {
    console.log('天蓝色博客加载完成');

    // 添加页面加载动画
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
