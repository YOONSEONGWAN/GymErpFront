// src/store.js

const initState = { user: null, logoutTimer: null };

function loadUser() {
    try { const r = sessionStorage.getItem('user'); return r ? JSON.parse(r) : null; }
    catch { return null; }
}

const preloaded = { ...initState, user: loadUser() };
const store = createStore(reducer, preloaded);

store.subscribe(() => {
    const { user } = store.getState();
    if (user) sessionStorage.setItem('user', JSON.stringify(user));
    else sessionStorage.removeItem('user');
});

export default store;
