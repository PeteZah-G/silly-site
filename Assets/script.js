// Assets/script.js - FINAL VERSION WITH FULL FAVORITES SYSTEM
window.addEventListener('load', () => {
    const views = {
        'home-page': document.getElementById('home-page-view'),
        'games': document.getElementById('games-view'),
        'favorites': document.getElementById('favorites-view'),
        'game': document.getElementById('game-view'),
        'settings': document.getElementById('settings-view')
    };

    const gameIframe = document.getElementById('game-iframe');
    const gameLoader = document.getElementById('game-loader');
    const navButtons = document.querySelectorAll('.nav-button');
    const searchInput = document.getElementById('game-search');
    const gameBoxWrapper = document.getElementById('game-box-wrapper');
    const favoritesWrapper = document.getElementById('favorites-wrapper');

    // Favorites System
    const getFavorites = () => JSON.parse(localStorage.getItem('imp_favorites') || '[]');
    const saveFavorites = (favs) => localStorage.setItem('imp_favorites', JSON.stringify(favs));

    const toggleFavorite = (box) => {
        const url = box.dataset.url;
        const title = box.dataset.title || box.querySelector('.game-title').textContent;
        const img = box.querySelector('img').src;
        let favs = getFavorites();
        const index = favs.findIndex(f => f.url === url);
        
        if (index === -1) {
            favs.push({ url, title, img });
            box.querySelector('.favorite-btn').classList.add('favorited');
            box.querySelector('.favorite-btn').textContent = '♥';
        } else {
            favs.splice(index, 1);
            box.querySelector('.favorite-btn').classList.remove('favorited');
            box.querySelector('.favorite-btn').textContent = '♡';
        }
        saveFavorites(favs);
        renderFavorites();
    };

    const renderFavorites = () => {
        const favs = getFavorites();
        favoritesWrapper.innerHTML = favs.length === 0 
            ? '<p class="text-center text-gray-400 mt-20 text-xl">No favorites yet.<br>Click ♥ on any game to add it here!</p>'
            : '';

        let row;
        favs.forEach((game, i) => {
            if (i % 5 === 0) {
                row = document.createElement('div');
                row.className = 'five-box-row';
                favoritesWrapper.appendChild(row);
            }
            const box = document.createElement('div');
            box.className = 'game-box';
            box.innerHTML = `
                <img src="${game.img}" loading="lazy">
                <div class="game-title">${game.title}</div>
                <button class="favorite-btn favorited">♥</button>
            `;
            box.onclick = (e) => {
                if (!e.target.classList.contains('favorite-btn')) loadGame(game.url);
            };
            box.querySelector('.favorite-btn').onclick = (e) => {
                e.stopPropagation();
                const original = document.querySelector(`.game-box[data-url="${game.url}"]`);
                if (original) toggleFavorite(original);
            };
            row.appendChild(box);
        });
    };

    const loadGame = (url) => {
        gameLoader.classList.add('active');
        gameIframe.src = url.includes('http') ? url : url;
        showView('game');
        setTimeout(() => gameLoader.classList.remove('active'), 2800);
    };

    const renderGames = (query = '') => {
        const favs = getFavorites();
        const favUrls = favs.map(f => f.url);
        const lower = query.toLowerCase();
        gameBoxWrapper.innerHTML = '';
        let row;

        document.querySelectorAll('#games-view .game-box, .game-box[data-url]').forEach((original, i) => {
            const title = (original.dataset.title || '').toLowerCase();
            if (query && !title.includes(lower)) return;

            if (i % 5 === 0) {
                row = document.createElement('div');
                row.className = 'five-box-row';
                gameBoxWrapper.appendChild(row);
            }

            const box = original.cloneNode(true);
            box.style.display = 'block';

            if (!box.querySelector('.favorite-btn')) {
                const btn = document.createElement('button');
                btn.className = 'favorite-btn';
                btn.textContent = favUrls.includes(original.dataset.url) ? '♥' : '♡';
                if (favUrls.includes(original.dataset.url)) btn.classList.add('favorited');
                box.appendChild(btn);
                btn.onclick = (e) => { e.stopPropagation(); toggleFavorite(box); };
            }

            box.onclick = () => loadGame(original.dataset.url);
            row.appendChild(box);
        });
    };

    window.showView = (name) => {
        Object.values(views).forEach(v => v.classList.add('hidden-view'));
        views[name].classList.remove('hidden-view');
        navButtons.forEach(b => {
            b.classList.toggle('bg-purple-600', b.dataset.view === name);
            b.classList.toggle('text-white', b.dataset.view === name);
            b.classList.toggle('text-gray-300', b.dataset.view !== name);
        });
        if (name === 'games') renderGames(searchInput.value);
        if (name === 'favorites') renderFavorites();
    };

    searchInput.addEventListener('input', () => renderGames(searchInput.value));

    // Init
    renderGames();
    renderFavorites();
    showView('home-page');
});
