(() => {
  const PAGE_TITLES = {
    dashboard: 'Dashboard',
    records: 'Tourism Records',
    visitors: 'Visitors',
    users: 'Users',
    recycle: 'Recycle Bin',
    logs: 'Activity Logs',
  };

  const state = {
    token: null,
    user: null,
    dashboard: null,
    records: [],
    visitors: [],
    users: [],
    recycle: [],
    logs: [],
    currentPage: 'dashboard',
    confirmHandler: null,
  };

  const dom = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    bindEvents();
    loadTheme();
    startClock();
    restoreSession();
  }

  function cacheDom() {
    dom.body = document.body;
    dom.loginPage = document.getElementById('loginPage');
    dom.app = document.getElementById('app');
    dom.loginForm = document.getElementById('loginForm');
    dom.loginError = document.getElementById('loginError');
    dom.passwordInput = document.getElementById('password');
    dom.togglePasswordBtn = document.getElementById('togglePasswordBtn');
    dom.preLoginThemeBtn = document.getElementById('preLoginThemeBtn');
    dom.themeBtn = document.getElementById('themeBtn');
    dom.pageTitle = document.getElementById('pageTitle');
    dom.clockText = document.getElementById('clockText');
    dom.sidebar = document.getElementById('sidebar');
    dom.sidebarOverlay = document.getElementById('sidebarOverlay');
    dom.menuBtn = document.getElementById('menuBtn');
    dom.globalSearch = document.getElementById('globalSearch');
    dom.navButtons = Array.from(document.querySelectorAll('.nav-btn'));
    dom.pages = Array.from(document.querySelectorAll('.page'));
    dom.toastWrap = document.getElementById('toastWrap');

    dom.modalBackdrop = document.getElementById('modalBackdrop');
    dom.modalTitle = document.getElementById('modalTitle');
    dom.modalSubtitle = document.getElementById('modalSubtitle');
    dom.modalBody = document.getElementById('modalBody');
    dom.closeModalBtn = document.getElementById('closeModalBtn');
    dom.cancelModalBtn = document.getElementById('cancelModalBtn');
    dom.entityForm = document.getElementById('entityForm');
    dom.saveModalBtn = document.getElementById('saveModalBtn');

    dom.confirmBackdrop = document.getElementById('confirmBackdrop');
    dom.confirmTitle = document.getElementById('confirmTitle');
    dom.confirmSubtitle = document.getElementById('confirmSubtitle');
    dom.confirmContent = document.getElementById('confirmContent');
    dom.confirmActionBtn = document.getElementById('confirmActionBtn');
    dom.confirmCancelBtn = document.getElementById('confirmCancelBtn');
    dom.closeConfirmBtn = document.getElementById('closeConfirmBtn');

    dom.logoutSidebarBtn = document.getElementById('logoutSidebarBtn');
    dom.logoutTopBtn = document.getElementById('logoutTopBtn');

    dom.addRecordBtn = document.getElementById('addRecordBtn');
    dom.addVisitorBtn = document.getElementById('addVisitorBtn');
    dom.addUserBtn = document.getElementById('addUserBtn');
    dom.emptyRecycleBtn = document.getElementById('emptyRecycleBtn');
    dom.exportLogsBtn = document.getElementById('exportLogsBtn');
    dom.clearLogsBtn = document.getElementById('clearLogsBtn');

    dom.badgeRecords = document.getElementById('badgeRecords');
    dom.badgeVisitors = document.getElementById('badgeVisitors');
    dom.badgeUsers = document.getElementById('badgeUsers');
    dom.badgeRecycle = document.getElementById('badgeRecycle');

    dom.recordSearch = document.getElementById('recordSearch');
    dom.recordCategoryFilter = document.getElementById('recordCategoryFilter');
    dom.clearRecordFilters = document.getElementById('clearRecordFilters');
    dom.recordTable = document.getElementById('recordTable');

    dom.visitorSearch = document.getElementById('visitorSearch');
    dom.visitorStatusFilter = document.getElementById('visitorStatusFilter');
    dom.clearVisitorFilters = document.getElementById('clearVisitorFilters');
    dom.visitorTable = document.getElementById('visitorTable');

    dom.userSearch = document.getElementById('userSearch');
    dom.userRoleFilter = document.getElementById('userRoleFilter');
    dom.clearUserFilters = document.getElementById('clearUserFilters');
    dom.userTable = document.getElementById('userTable');

    dom.recycleSearch = document.getElementById('recycleSearch');
    dom.recycleTypeFilter = document.getElementById('recycleTypeFilter');
    dom.clearRecycleFilters = document.getElementById('clearRecycleFilters');
    dom.recycleTable = document.getElementById('recycleTable');

    dom.logSearch = document.getElementById('logSearch');
    dom.logLimitFilter = document.getElementById('logLimitFilter');
    dom.clearLogSearch = document.getElementById('clearLogSearch');
    dom.logsList = document.getElementById('logsList');

    dom.statRecords = document.getElementById('statRecords');
    dom.statVisitors = document.getElementById('statVisitors');
    dom.statUsers = document.getElementById('statUsers');
    dom.statRecycle = document.getElementById('statRecycle');
    dom.statRecordsMeta = document.getElementById('statRecordsMeta');
    dom.statVisitorsMeta = document.getElementById('statVisitorsMeta');
    dom.statUsersMeta = document.getElementById('statUsersMeta');
    dom.statRecycleMeta = document.getElementById('statRecycleMeta');
    dom.destinationBars = document.getElementById('destinationBars');
    dom.activityFeed = document.getElementById('activityFeed');
    dom.recentRecords = document.getElementById('recentRecords');
    dom.summaryList = document.getElementById('summaryList');

    dom.quickAddButtons = Array.from(document.querySelectorAll('[data-quick-add]'));
  }

  function bindEvents() {
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    dom.preLoginThemeBtn.addEventListener('click', toggleTheme);
    dom.themeBtn.addEventListener('click', toggleTheme);
    dom.logoutSidebarBtn.addEventListener('click', confirmLogout);
    dom.logoutTopBtn.addEventListener('click', confirmLogout);
    dom.menuBtn.addEventListener('click', openSidebar);
    dom.sidebarOverlay.addEventListener('click', closeSidebar);
    dom.closeModalBtn.addEventListener('click', closeModal);
    dom.cancelModalBtn.addEventListener('click', closeModal);
    dom.entityForm.addEventListener('submit', handleEntitySubmit);
    dom.closeConfirmBtn.addEventListener('click', closeConfirm);
    dom.confirmCancelBtn.addEventListener('click', closeConfirm);
    dom.confirmActionBtn.addEventListener('click', () => {
      if (typeof state.confirmHandler === 'function') {
        state.confirmHandler();
      }
    });

    dom.exportLogsBtn.addEventListener('click', () => downloadAuthenticatedFile('/activity-logs/export/', 'activity-logs.json'));
    dom.clearLogsBtn.addEventListener('click', confirmClearLogs);
    dom.emptyRecycleBtn.addEventListener('click', confirmEmptyRecycleBin);

    dom.addRecordBtn.addEventListener('click', () => openEntityModal('record'));
    dom.addVisitorBtn.addEventListener('click', () => openEntityModal('visitor'));
    dom.addUserBtn.addEventListener('click', () => openEntityModal('user'));
    dom.quickAddButtons.forEach((button) => {
      button.addEventListener('click', () => openEntityModal(button.dataset.quickAdd));
    });

    dom.navButtons.forEach((button) => {
      button.addEventListener('click', () => switchPage(button.dataset.page));
    });

    dom.globalSearch.addEventListener('input', handleGlobalSearch);

    dom.recordSearch.addEventListener('input', renderRecords);
    dom.recordCategoryFilter.addEventListener('change', renderRecords);
    dom.clearRecordFilters.addEventListener('click', () => {
      dom.recordSearch.value = '';
      dom.recordCategoryFilter.value = '';
      syncGlobalSearchFromPage();
      renderRecords();
    });

    dom.visitorSearch.addEventListener('input', renderVisitors);
    dom.visitorStatusFilter.addEventListener('change', renderVisitors);
    dom.clearVisitorFilters.addEventListener('click', () => {
      dom.visitorSearch.value = '';
      dom.visitorStatusFilter.value = '';
      syncGlobalSearchFromPage();
      renderVisitors();
    });

    dom.userSearch.addEventListener('input', renderUsers);
    dom.userRoleFilter.addEventListener('change', renderUsers);
    dom.clearUserFilters.addEventListener('click', () => {
      dom.userSearch.value = '';
      dom.userRoleFilter.value = '';
      syncGlobalSearchFromPage();
      renderUsers();
    });

    dom.recycleSearch.addEventListener('input', renderRecycle);
    dom.recycleTypeFilter.addEventListener('change', renderRecycle);
    dom.clearRecycleFilters.addEventListener('click', () => {
      dom.recycleSearch.value = '';
      dom.recycleTypeFilter.value = '';
      syncGlobalSearchFromPage();
      renderRecycle();
    });

    dom.logSearch.addEventListener('input', refreshLogsOnly);
    dom.logLimitFilter.addEventListener('change', refreshLogsOnly);
    dom.clearLogSearch.addEventListener('click', () => {
      dom.logSearch.value = '';
      dom.logLimitFilter.value = '25';
      syncGlobalSearchFromPage();
      refreshLogsOnly();
    });

    dom.recordTable.addEventListener('click', handleRecordTableClick);
    dom.visitorTable.addEventListener('click', handleVisitorTableClick);
    dom.userTable.addEventListener('click', handleUserTableClick);
    dom.recycleTable.addEventListener('click', handleRecycleTableClick);
  }

  function getApiBase() {
    return (window.CITOSIS_CONFIG && window.CITOSIS_CONFIG.apiBase) || '/api';
  }

  function safeStorageGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function safeStorageRemove(storage, key) {
    try {
      storage.removeItem(key);
    } catch (error) {
      // Ignore storage cleanup errors.
    }
  }

  function getCookieValue(name) {
    const value = `; ${document.cookie || ''}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length !== 2) return null;
    return parts.pop().split(';').shift() || null;
  }

  function setCookieValue(name, value, maxAgeSeconds = null) {
    let cookie = `${name}=${value}; path=/; SameSite=Lax`;
    if (maxAgeSeconds != null) {
      cookie += `; Max-Age=${maxAgeSeconds}`;
    }
    document.cookie = cookie;
  }

  function clearCookieValue(name) {
    document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax`;
  }

  function parseStoredJson(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function getPersistedSession() {
    const sessionToken = safeStorageGet(sessionStorage, 'citosis_token');
    if (sessionToken) {
      return {
        token: sessionToken,
        user: parseStoredJson(safeStorageGet(sessionStorage, 'citosis_user')),
      };
    }

    const localToken = safeStorageGet(localStorage, 'citosis_token');
    if (localToken) {
      return {
        token: localToken,
        user: parseStoredJson(safeStorageGet(localStorage, 'citosis_user')),
      };
    }

    const cookieToken = getCookieValue('citosis_token');
    if (cookieToken) {
      return { token: cookieToken, user: null };
    }

    return { token: null, user: null };
  }

  function persistSession(token, user, remember) {
    clearPersistedSession();
    const payload = JSON.stringify(user);
    safeStorageSet(sessionStorage, 'citosis_token', token);
    safeStorageSet(sessionStorage, 'citosis_user', payload);
    if (remember) {
      safeStorageSet(localStorage, 'citosis_token', token);
      safeStorageSet(localStorage, 'citosis_user', payload);
    }
    const maxAgeSeconds = remember ? 60 * 60 * 24 * 30 : null;
    setCookieValue('citosis_token', token, maxAgeSeconds);
  }

  function updatePersistedUser(user) {
    const payload = JSON.stringify(user);
    if (safeStorageGet(sessionStorage, 'citosis_token')) {
      safeStorageSet(sessionStorage, 'citosis_user', payload);
    }
    if (safeStorageGet(localStorage, 'citosis_token')) {
      safeStorageSet(localStorage, 'citosis_user', payload);
    }
  }

  function clearPersistedSession() {
    safeStorageRemove(localStorage, 'citosis_token');
    safeStorageRemove(localStorage, 'citosis_user');
    safeStorageRemove(sessionStorage, 'citosis_token');
    safeStorageRemove(sessionStorage, 'citosis_user');
    clearCookieValue('citosis_token');
  }

  function restoreSession() {
    const session = getPersistedSession();
    if (!session.token) {
      showLogin();
      return;
    }

    state.token = session.token;
    if (session.user) {
      state.user = session.user;
    }
    showApp();

    const hadStoredUser = !!session.user;
    if (hadStoredUser) {
      refreshAllData();
    }

    apiRequest('/auth/me/')
      .then((user) => {
        state.user = user;
        updatePersistedUser(user);
        updateUiForRole();
        if (!hadStoredUser) {
          refreshAllData();
        }
      })
      .catch((error) => {
        if (error && (error.status === 401 || error.status === 403)) {
          clearPersistedSession();
          state.token = null;
          state.user = null;
          showLogin();
          return;
        }
        showToast(
          'Connection issue',
          'Unable to verify your session right now. Refresh if data does not load.',
          'fa-solid fa-wifi'
        );
      });
  }

  async function apiRequest(path, options = {}) {
    const config = { method: 'GET', ...options };
    const headers = new Headers(config.headers || {});
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    if (!(config.body instanceof FormData) && config.body != null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (state.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Token ${state.token}`);
    }

    const response = await fetch(`${getApiBase()}${path}`, {
      method: config.method,
      headers,
      body: config.body,
    });

    const contentType = response.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else if (!config.expectBlob) {
      const text = await response.text();
      payload = text ? { detail: text } : null;
    }

    if (!response.ok) {
      const error = new Error((payload && (payload.detail || payload.message)) || 'Request failed.');
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    if (config.expectBlob) {
      return response.blob();
    }

    return payload;
  }

  async function safeRequest(path, fallbackValue) {
    try {
      return await apiRequest(path);
    } catch (error) {
      if (error.status === 403) {
        return fallbackValue;
      }
      throw error;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    dom.loginError.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = dom.passwordInput.value;
    const remember = document.getElementById('rememberSession').checked;

    if (!username || !password) {
      dom.loginError.textContent = 'Enter your username/email and password.';
      return;
    }

    try {
      const payload = await apiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password, remember }),
      });
      state.token = payload.token;
      state.user = payload.user;
      persistSession(payload.token, payload.user, remember);
      showApp();
      showToast('Welcome back', `Signed in as ${payload.user.name}.`);
      await refreshAllData();
      dom.loginForm.reset();
      document.getElementById('rememberSession').checked = remember;
    } catch (error) {
      dom.loginError.textContent = error.message || 'Unable to sign in.';
    }
  }

  function confirmLogout() {
    openConfirm({
      title: 'Sign out',
      subtitle: 'You will need to sign in again to continue.',
      content: '<p>Are you sure you want to log out?</p>',
      confirmText: 'Log out',
      onConfirm: async () => {
        closeConfirm();
        await performLogout();
      },
    });
  }

  async function performLogout() {
    try {
      if (state.token) {
        await apiRequest('/auth/logout/', { method: 'POST' });
      }
    } catch (error) {
      // Ignore logout transport errors and clear session anyway.
    } finally {
      clearPersistedSession();
      state.token = null;
      state.user = null;
      state.dashboard = null;
      state.records = [];
      state.visitors = [];
      state.users = [];
      state.recycle = [];
      state.logs = [];
      showLogin();
      showToast('Signed out', 'Your session has been cleared.');
    }
  }

  function showLogin() {
    dom.loginPage.classList.remove('hidden');
    dom.app.classList.add('hidden');
    closeSidebar();
    dom.pageTitle.textContent = PAGE_TITLES.dashboard;
  }

  function showApp() {
    dom.loginPage.classList.add('hidden');
    dom.app.classList.remove('hidden');
    switchPage('dashboard');
    updateUiForRole();
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem('citosis_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    }
  }

  function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('citosis_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  }

  function togglePasswordVisibility() {
    const isPassword = dom.passwordInput.type === 'password';
    dom.passwordInput.type = isPassword ? 'text' : 'password';
    dom.togglePasswordBtn.innerHTML = isPassword
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';
  }

  function startClock() {
    const updateClock = () => {
      const now = new Date();
      dom.clockText.textContent = now.toLocaleString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      });
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  function openSidebar() {
    dom.sidebar.classList.add('open');
    dom.sidebarOverlay.classList.add('show');
  }

  function closeSidebar() {
    dom.sidebar.classList.remove('open');
    dom.sidebarOverlay.classList.remove('show');
  }

  function switchPage(page) {
    state.currentPage = page;
    dom.navButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.page === page);
    });
    dom.pages.forEach((section) => {
      section.classList.toggle('active', section.id === page);
    });
    dom.pageTitle.textContent = PAGE_TITLES[page] || 'Dashboard';
    syncGlobalSearchFromPage();
    renderCurrentPage();
    closeSidebar();
  }

  function syncGlobalSearchFromPage() {
    const pageSearchMap = {
      records: dom.recordSearch,
      visitors: dom.visitorSearch,
      users: dom.userSearch,
      recycle: dom.recycleSearch,
      logs: dom.logSearch,
    };
    dom.globalSearch.value = pageSearchMap[state.currentPage] ? pageSearchMap[state.currentPage].value : '';
  }

  function handleGlobalSearch(event) {
    const value = event.target.value;
    const pageSearchMap = {
      records: dom.recordSearch,
      visitors: dom.visitorSearch,
      users: dom.userSearch,
      recycle: dom.recycleSearch,
      logs: dom.logSearch,
    };
    const targetInput = pageSearchMap[state.currentPage];
    if (targetInput) {
      targetInput.value = value;
      if (state.currentPage === 'logs') {
        refreshLogsOnly();
      } else {
        renderCurrentPage();
      }
    }
  }

  async function refreshAllData() {
    try {
      const logLimit = dom.logLimitFilter.value || '25';
      const [dashboard, records, visitors, users, recycle, logs] = await Promise.all([
        apiRequest('/dashboard/overview/'),
        apiRequest('/records/'),
        apiRequest('/visitors/'),
        safeRequest('/users/', []),
        safeRequest('/recycle-bin/', []),
        apiRequest(`/activity-logs/?limit=${encodeURIComponent(logLimit)}`),
      ]);

      state.dashboard = dashboard;
      state.records = Array.isArray(records) ? records : [];
      state.visitors = Array.isArray(visitors) ? visitors : [];
      state.users = Array.isArray(users) ? users : [];
      state.recycle = Array.isArray(recycle) ? recycle : [];
      state.logs = Array.isArray(logs) ? logs : [];

      renderAll();
      updateUiForRole();
    } catch (error) {
      showToast('Error', error.message || 'Unable to load dashboard data.', 'fa-solid fa-triangle-exclamation');
    }
  }

  async function refreshLogsOnly() {
    if (!state.token) {
      return;
    }
    try {
      const query = new URLSearchParams({
        limit: dom.logLimitFilter.value || '25',
      });
      if (dom.logSearch.value.trim()) {
        query.set('search', dom.logSearch.value.trim());
      }
      state.logs = await apiRequest(`/activity-logs/?${query.toString()}`);
      renderLogs();
    } catch (error) {
      showToast('Logs error', error.message || 'Unable to load activity logs.', 'fa-solid fa-triangle-exclamation');
    }
  }

  function renderAll() {
    renderDashboard();
    renderRecords();
    renderVisitors();
    renderUsers();
    renderRecycle();
    renderLogs();
    updateBadges();
  }

  function renderCurrentPage() {
    switch (state.currentPage) {
      case 'records':
        renderRecords();
        break;
      case 'visitors':
        renderVisitors();
        break;
      case 'users':
        renderUsers();
        break;
      case 'recycle':
        renderRecycle();
        break;
      case 'logs':
        renderLogs();
        break;
      default:
        renderDashboard();
        break;
    }
  }

  function renderDashboard() {
    const stats = state.dashboard && state.dashboard.stats ? state.dashboard.stats : {
      records: state.records.length,
      visitors: state.visitors.length,
      users: state.users.filter((user) => user.status === 'Active').length,
      recycle: state.recycle.length,
    };

    dom.statRecords.textContent = stats.records || 0;
    dom.statVisitors.textContent = stats.visitors || 0;
    dom.statUsers.textContent = stats.users || 0;
    dom.statRecycle.textContent = stats.recycle || 0;

    dom.statRecordsMeta.textContent = stats.records ? `${stats.records} destination records stored.` : 'No destinations saved yet.';
    dom.statVisitorsMeta.textContent = stats.visitors ? `${stats.visitors} visitor entries tracked.` : 'No visitor records yet.';
    dom.statUsersMeta.textContent = stats.users ? `${stats.users} active staff account(s) available.` : 'No active staff accounts.';
    dom.statRecycleMeta.textContent = stats.recycle ? `${stats.recycle} item(s) can still be restored.` : 'Deleted items are recoverable here.';

    const destinationRows = Array.isArray(state.dashboard && state.dashboard.destination_popularity)
      ? state.dashboard.destination_popularity
      : [];

    if (!destinationRows.length) {
      dom.destinationBars.innerHTML = buildEmptyState('No destination visits yet.');
    } else {
      const maxValue = Math.max(...destinationRows.map((row) => Number(row.total) || 0), 1);
      dom.destinationBars.innerHTML = destinationRows
        .map((row) => {
          const width = Math.max(8, Math.round(((Number(row.total) || 0) / maxValue) * 100));
          return `
            <div class="bar-item">
              <label>
                <span>${escapeHtml(row.place || 'Unknown destination')}</span>
                <span>${Number(row.total) || 0} visit(s)</span>
              </label>
              <div class="bar-track">
                <div class="bar-fill" style="width:${width}%"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    const recentActivity = Array.isArray(state.dashboard && state.dashboard.recent_activity)
      ? state.dashboard.recent_activity
      : [];
    dom.activityFeed.innerHTML = recentActivity.length
      ? recentActivity
          .map((item) => `
            <div class="list-item">
              <div>
                <strong>${escapeHtml(item.action || 'Activity')}</strong>
                <p>${escapeHtml(item.details || 'No details provided.')}</p>
                <small>${escapeHtml(item.user_name || item.user_username || 'System')} • ${formatDateTime(item.created_at)}</small>
              </div>
              <span class="mini-pill"><i class="fa-solid fa-clock"></i>${timeAgo(item.created_at)}</span>
            </div>
          `)
          .join('')
      : buildEmptyState('No activity logged yet.');

    const recentRecords = Array.isArray(state.dashboard && state.dashboard.recent_records)
      ? state.dashboard.recent_records
      : [];
    dom.recentRecords.innerHTML = recentRecords.length
      ? recentRecords
          .map((record) => `
            <div class="list-item">
              <div>
                <strong>${escapeHtml(record.name)}</strong>
                <p>${escapeHtml(record.location)} • ${escapeHtml(record.category)}</p>
                <small>Updated ${formatDateTime(record.updated_at)}</small>
              </div>
            </div>
          `)
          .join('')
      : buildEmptyState('No recent destination updates.');

    const summaryItems = Array.isArray(state.dashboard && state.dashboard.summary)
      ? state.dashboard.summary
      : [];
    dom.summaryList.innerHTML = summaryItems.length
      ? summaryItems
          .map((item) => `
            <div class="list-item">
              <div>
                <strong>${escapeHtml(item.title || 'Summary')}</strong>
                <p>${escapeHtml(item.description || '')}</p>
              </div>
              <span class="mini-pill"><i class="fa-solid fa-chart-simple"></i>${escapeHtml(String(item.value ?? 0))}</span>
            </div>
          `)
          .join('')
      : buildEmptyState('Summary data will appear here once records are added.');
  }

  function renderRecords() {
    const search = dom.recordSearch.value.trim().toLowerCase();
    const category = dom.recordCategoryFilter.value.trim();
    const filtered = state.records.filter((record) => {
      const matchesSearch = !search || [record.name, record.location, record.category, record.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search);
      const matchesCategory = !category || record.category === category;
      return matchesSearch && matchesCategory;
    });

    if (!filtered.length) {
      dom.recordTable.innerHTML = buildEmptyTableRow(6, 'No tourism records match your filters.');
      return;
    }

    dom.recordTable.innerHTML = filtered.map((record) => buildRecordRow(record)).join('');
  }

  function renderVisitors() {
    const search = dom.visitorSearch.value.trim().toLowerCase();
    const statusValue = dom.visitorStatusFilter.value.trim();
    const filtered = state.visitors.filter((visitor) => {
      const matchesSearch = !search || [visitor.name, visitor.place, visitor.origin]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search);
      const matchesStatus = !statusValue || visitor.status === statusValue;
      return matchesSearch && matchesStatus;
    });

    if (!filtered.length) {
      dom.visitorTable.innerHTML = buildEmptyTableRow(6, 'No visitor entries match your filters.');
      return;
    }

    dom.visitorTable.innerHTML = filtered.map((visitor) => buildVisitorRow(visitor)).join('');
  }

  function renderUsers() {
    if (!canViewUsers()) {
      dom.userTable.innerHTML = buildEmptyTableRow(6, 'Your role does not have permission to view user accounts.');
      return;
    }

    const search = dom.userSearch.value.trim().toLowerCase();
    const role = dom.userRoleFilter.value.trim();
    const filtered = state.users.filter((user) => {
      const matchesSearch = !search || [user.name, user.username, user.email, user.office, user.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search);
      const matchesRole = !role || user.role === role;
      return matchesSearch && matchesRole;
    });

    if (!filtered.length) {
      dom.userTable.innerHTML = buildEmptyTableRow(6, 'No users match your filters.');
      return;
    }

    dom.userTable.innerHTML = filtered.map((user) => buildUserRow(user)).join('');
  }

  function renderRecycle() {
    if (!canManageRecycle()) {
      dom.recycleTable.innerHTML = buildEmptyTableRow(4, 'Your role does not have permission to access the recycle bin.');
      return;
    }

    const search = dom.recycleSearch.value.trim().toLowerCase();
    const itemType = dom.recycleTypeFilter.value.trim().toLowerCase();
    const filtered = state.recycle.filter((item) => {
      const haystack = JSON.stringify(item.item_data || {}).toLowerCase();
      const matchesSearch = !search || haystack.includes(search) || String(item.item_type || '').toLowerCase().includes(search);
      const matchesType = !itemType || item.item_type === itemType;
      return matchesSearch && matchesType;
    });

    if (!filtered.length) {
      dom.recycleTable.innerHTML = buildEmptyTableRow(4, 'Recycle bin is empty or no items match your filters.');
      return;
    }

    dom.recycleTable.innerHTML = filtered.map((item) => buildRecycleRow(item)).join('');
  }

  function renderLogs() {
    if (!state.logs.length) {
      dom.logsList.innerHTML = buildEmptyState('No activity logs available.');
      return;
    }

    dom.logsList.innerHTML = state.logs
      .map((log) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(log.action || 'Activity')}</strong>
            <p>${escapeHtml(log.details || 'No details provided.')}</p>
            <small>${escapeHtml(log.user_name || log.user_username || 'System')} • ${formatDateTime(log.created_at)}</small>
          </div>
          <span class="mini-pill"><i class="fa-solid fa-server"></i>${escapeHtml(log.ip_address || 'local')}</span>
        </div>
      `)
      .join('');
  }

  function updateBadges() {
    dom.badgeRecords.textContent = String(state.records.length);
    dom.badgeVisitors.textContent = String(state.visitors.length);
    dom.badgeUsers.textContent = String(state.users.length);
    dom.badgeRecycle.textContent = String(state.recycle.length);
  }

  function updateUiForRole() {
    const canUsers = canViewUsers();
    const canCreateUsers = canManageUsers();
    const canRecycle = canManageRecycle();
    const canClearLogsValue = canManageRecycle();

    toggleElement(dom.addUserBtn, canCreateUsers);
    dom.quickAddButtons.forEach((button) => {
      if (button.dataset.quickAdd === 'user') {
        toggleElement(button, canCreateUsers);
      }
    });
    toggleElement(dom.emptyRecycleBtn, canRecycle);
    toggleElement(dom.clearLogsBtn, canClearLogsValue);

    dom.navButtons.forEach((button) => {
      if (button.dataset.page === 'users') {
        button.classList.toggle('hidden', !canUsers && !canCreateUsers);
      }
      if (button.dataset.page === 'recycle') {
        button.classList.toggle('hidden', !canRecycle);
      }
    });
  }

  function toggleElement(element, shouldShow) {
    if (!element) return;
    element.classList.toggle('hidden', !shouldShow);
  }

  function canViewUsers() {
    return !!state.user && ['Admin', 'Manager'].includes(state.user.role);
  }

  function canManageUsers() {
    return !!state.user && state.user.role === 'Admin';
  }

  function canManageRecycle() {
    return !!state.user && ['Admin', 'Manager'].includes(state.user.role);
  }

  function canDeleteContent() {
    return !!state.user && ['Admin', 'Manager'].includes(state.user.role);
  }

  function buildRecordRow(record) {
    const imageMarkup = record.image_url
      ? `<div class="thumb"><img src="${escapeHtml(record.image_url)}" alt="${escapeHtml(record.name)}"></div>`
      : '<div class="thumb"><i class="fa-regular fa-image"></i></div>';
    return `
      <tr>
        <td>${imageMarkup}</td>
        <td>
          <div class="cell-title">
            <strong>${escapeHtml(record.name)}</strong>
            <small>${escapeHtml(record.description || 'No description provided.')}</small>
          </div>
        </td>
        <td>${escapeHtml(record.location)}</td>
        <td><span class="type-chip status-record">${escapeHtml(record.category)}</span></td>
        <td>${formatDateTime(record.updated_at)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary action-btn" data-action="edit-record" data-id="${record.id}"><i class="fa-solid fa-pen"></i>Edit</button>
            ${canDeleteContent() ? `<button class="btn btn-danger action-btn" data-action="delete-record" data-id="${record.id}"><i class="fa-solid fa-trash"></i>Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  function buildVisitorRow(visitor) {
    return `
      <tr>
        <td>
          <div class="cell-title">
            <strong>${escapeHtml(visitor.name)}</strong>
            <small>Saved by ${escapeHtml(visitor.created_by_name || 'System')}</small>
          </div>
        </td>
        <td>${escapeHtml(visitor.place || visitor.tourism_record_name || '—')}</td>
        <td>${escapeHtml(visitor.origin)}</td>
        <td>${formatDateTime(visitor.visit_date)}</td>
        <td><span class="status-chip ${visitor.status === 'Checked In' ? 'status-checked-in' : 'status-checked-out'}">${escapeHtml(visitor.status)}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary action-btn" data-action="edit-visitor" data-id="${visitor.id}"><i class="fa-solid fa-pen"></i>Edit</button>
            ${canDeleteContent() ? `<button class="btn btn-danger action-btn" data-action="delete-visitor" data-id="${visitor.id}"><i class="fa-solid fa-trash"></i>Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  function buildUserRow(user) {
    const roleClass = user.role === 'Admin' ? 'status-admin' : 'status-user';
    const statusClass = user.status === 'Active' ? 'status-active' : 'status-inactive';
    return `
      <tr>
        <td>
          <div class="cell-title">
            <strong>${escapeHtml(user.name)}</strong>
            <small>@${escapeHtml(user.username)} • ${escapeHtml(user.email)}</small>
          </div>
        </td>
        <td>${escapeHtml(user.office || '—')}</td>
        <td><span class="status-chip ${roleClass}">${escapeHtml(user.role)}</span></td>
        <td><span class="status-chip ${statusClass}">${escapeHtml(user.status)}</span></td>
        <td>${formatDateTime(user.updated_at)}</td>
        <td>
          <div class="table-actions">
            ${canManageUsers() ? `<button class="btn btn-secondary action-btn" data-action="edit-user" data-id="${user.id}"><i class="fa-solid fa-pen"></i>Edit</button>` : ''}
            ${canManageUsers() ? `<button class="btn btn-danger action-btn" data-action="delete-user" data-id="${user.id}"><i class="fa-solid fa-trash"></i>Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  function buildRecycleRow(item) {
    const name = item.item_name || readItemName(item.item_data) || `Item ${item.item_id}`;
    return `
      <tr>
        <td><span class="status-chip status-recycle">${escapeHtml(capitalize(item.item_type))}</span></td>
        <td>
          <div class="cell-title">
            <strong>${escapeHtml(name)}</strong>
            <small>ID: ${escapeHtml(String(item.item_id))}</small>
          </div>
        </td>
        <td>${formatDateTime(item.deleted_at)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-success action-btn" data-action="restore-recycle" data-id="${item.id}"><i class="fa-solid fa-rotate-left"></i>Restore</button>
            <button class="btn btn-danger action-btn" data-action="purge-recycle" data-id="${item.id}"><i class="fa-solid fa-trash"></i>Purge</button>
          </div>
        </td>
      </tr>
    `;
  }

  function handleRecordTableClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const record = state.records.find((item) => Number(item.id) === id);
    if (!record) return;

    if (button.dataset.action === 'edit-record') {
      openEntityModal('record', record);
      return;
    }

    if (button.dataset.action === 'delete-record') {
      openConfirm({
        title: 'Delete tourism record',
        subtitle: 'This action will move the item to the recycle bin.',
        content: `<p>Delete <strong>${escapeHtml(record.name)}</strong> from active records?</p>`,
        confirmText: 'Delete',
        onConfirm: async () => {
          try {
            await apiRequest(`/records/${record.id}/`, { method: 'DELETE' });
            closeConfirm();
            showToast('Record deleted', `${record.name} moved to recycle bin.`);
            await refreshAllData();
          } catch (error) {
            showToast('Delete failed', error.message, 'fa-solid fa-triangle-exclamation');
          }
        },
      });
    }
  }

  function handleVisitorTableClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const visitor = state.visitors.find((item) => Number(item.id) === id);
    if (!visitor) return;

    if (button.dataset.action === 'edit-visitor') {
      openEntityModal('visitor', visitor);
      return;
    }

    if (button.dataset.action === 'delete-visitor') {
      openConfirm({
        title: 'Delete visitor entry',
        subtitle: 'This action will move the entry to the recycle bin.',
        content: `<p>Delete visitor <strong>${escapeHtml(visitor.name)}</strong>?</p>`,
        confirmText: 'Delete',
        onConfirm: async () => {
          try {
            await apiRequest(`/visitors/${visitor.id}/`, { method: 'DELETE' });
            closeConfirm();
            showToast('Visitor deleted', `${visitor.name} moved to recycle bin.`);
            await refreshAllData();
          } catch (error) {
            showToast('Delete failed', error.message, 'fa-solid fa-triangle-exclamation');
          }
        },
      });
    }
  }

  function handleUserTableClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const user = state.users.find((item) => Number(item.id) === id);
    if (!user) return;

    if (button.dataset.action === 'edit-user') {
      openEntityModal('user', user);
      return;
    }

    if (button.dataset.action === 'delete-user') {
      openConfirm({
        title: 'Delete user account',
        subtitle: 'This action will deactivate the account and move it to the recycle bin.',
        content: `<p>Delete staff account for <strong>${escapeHtml(user.name)}</strong>?</p>`,
        confirmText: 'Delete',
        onConfirm: async () => {
          try {
            await apiRequest(`/users/${user.id}/`, { method: 'DELETE' });
            closeConfirm();
            showToast('User deleted', `${user.name} moved to recycle bin.`);
            await refreshAllData();
          } catch (error) {
            showToast('Delete failed', error.message, 'fa-solid fa-triangle-exclamation');
          }
        },
      });
    }
  }

  function handleRecycleTableClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const item = state.recycle.find((entry) => Number(entry.id) === id);
    if (!item) return;
    const itemName = item.item_name || readItemName(item.item_data) || `Item ${item.item_id}`;

    if (button.dataset.action === 'restore-recycle') {
      openConfirm({
        title: 'Restore item',
        subtitle: 'The item will be returned to its original table.',
        content: `<p>Restore <strong>${escapeHtml(itemName)}</strong>?</p>`,
        confirmText: 'Restore',
        onConfirm: async () => {
          try {
            await apiRequest(`/recycle-bin/${item.id}/restore/`, { method: 'POST' });
            closeConfirm();
            showToast('Item restored', `${itemName} has been restored.`);
            await refreshAllData();
          } catch (error) {
            showToast('Restore failed', error.message, 'fa-solid fa-triangle-exclamation');
          }
        },
      });
      return;
    }

    if (button.dataset.action === 'purge-recycle') {
      openConfirm({
        title: 'Permanently remove item',
        subtitle: 'This action cannot be undone.',
        content: `<p>Permanently remove <strong>${escapeHtml(itemName)}</strong>?</p>`,
        confirmText: 'Purge',
        onConfirm: async () => {
          try {
            await apiRequest(`/recycle-bin/${item.id}/purge/`, { method: 'DELETE' });
            closeConfirm();
            showToast('Item purged', `${itemName} was permanently removed.`);
            await refreshAllData();
          } catch (error) {
            showToast('Purge failed', error.message, 'fa-solid fa-triangle-exclamation');
          }
        },
      });
    }
  }

  function openEntityModal(entity, item = null) {
    let config = null;
    if (entity === 'record') {
      config = buildRecordModal(item);
    } else if (entity === 'visitor') {
      config = buildVisitorModal(item);
    } else if (entity === 'user') {
      if (!canManageUsers()) {
        showToast('Access denied', 'Only admins can manage user accounts.', 'fa-solid fa-lock');
        return;
      }
      config = buildUserModal(item);
    }

    if (!config) return;

    dom.modalTitle.textContent = config.title;
    dom.modalSubtitle.textContent = config.subtitle;
    dom.modalBody.innerHTML = config.body;
    dom.entityForm.dataset.entity = entity;
    dom.entityForm.dataset.id = item && item.id ? String(item.id) : '';
    dom.modalBackdrop.classList.add('show');

    if (entity === 'record') {
      const fileInput = document.getElementById('recordImageInput');
      if (fileInput) {
        fileInput.addEventListener('change', handleRecordImagePreview);
      }
    }

    if (entity === 'visitor') {
      const destinationSelect = document.getElementById('visitorDestination');
      if (destinationSelect) {
        destinationSelect.addEventListener('change', syncVisitorPlaceFromSelect);
      }
    }
  }

  function closeModal() {
    dom.modalBackdrop.classList.remove('show');
    dom.entityForm.reset();
    dom.entityForm.dataset.entity = '';
    dom.entityForm.dataset.id = '';
    dom.modalBody.innerHTML = '';
  }

  function openConfirm({ title, subtitle, content, confirmText = 'Confirm', onConfirm }) {
    dom.confirmTitle.textContent = title || 'Confirm action';
    dom.confirmSubtitle.textContent = subtitle || 'Please review this action before continuing.';
    dom.confirmContent.innerHTML = content || '';
    dom.confirmActionBtn.textContent = confirmText;
    state.confirmHandler = async () => {
      dom.confirmActionBtn.disabled = true;
      try {
        await onConfirm();
      } finally {
        dom.confirmActionBtn.disabled = false;
      }
    };
    dom.confirmBackdrop.classList.add('show');
  }

  function closeConfirm() {
    dom.confirmBackdrop.classList.remove('show');
    dom.confirmContent.innerHTML = '';
    dom.confirmActionBtn.textContent = 'Confirm';
    state.confirmHandler = null;
  }

  function buildRecordModal(item) {
    const categories = ['Beach', 'Mountain', 'Heritage', 'Nature', 'Park', 'Event', 'Other'];
    const preview = item && item.image_url
      ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}">`
      : '<div><i class="fa-regular fa-image"></i><p>Upload a destination cover image.</p></div>';
    return {
      title: item ? 'Edit Tourism Record' : 'Add Tourism Record',
      subtitle: item ? 'Update destination details and media.' : 'Create a new tourism destination record.',
      body: `
        <div class="modal-grid">
          <div class="field">
            <label for="recordName">Place Name</label>
            <input class="form-control" id="recordName" name="name" type="text" value="${escapeAttribute(item ? item.name : '')}" required>
          </div>
          <div class="field">
            <label for="recordLocation">Location</label>
            <input class="form-control" id="recordLocation" name="location" type="text" value="${escapeAttribute(item ? item.location : '')}" required>
          </div>
          <div class="field span-2">
            <label for="recordCategory">Category</label>
            <select class="form-control" id="recordCategory" name="category" required>
              ${categories.map((category) => `<option value="${category}" ${item && item.category === category ? 'selected' : ''}>${category}</option>`).join('')}
            </select>
          </div>
          <div class="field span-2">
            <label for="recordDescription">Description</label>
            <textarea class="form-control" id="recordDescription" name="description" placeholder="Write a short destination description.">${escapeHtml(item ? item.description || '' : '')}</textarea>
          </div>
          <div class="field span-2">
            <label for="recordImageInput">Destination Image</label>
            <input class="form-control" id="recordImageInput" name="image_path" type="file" accept="image/*">
          </div>
          <div class="field span-2">
            <div id="recordImagePreview" class="image-preview">${preview}</div>
          </div>
        </div>
      `,
    };
  }

  function buildVisitorModal(item) {
    const destinations = state.records.map((record) => `<option value="${record.id}" ${item && Number(item.tourism_record) === Number(record.id) ? 'selected' : ''}>${escapeHtml(record.name)}</option>`).join('');
    return {
      title: item ? 'Edit Visitor' : 'Add Visitor',
      subtitle: item ? 'Update guest visit details.' : 'Create a new guest entry.',
      body: `
        <div class="modal-grid">
          <div class="field">
            <label for="visitorName">Visitor Name</label>
            <input class="form-control" id="visitorName" name="name" type="text" value="${escapeAttribute(item ? item.name : '')}" required>
          </div>
          <div class="field">
            <label for="visitorOrigin">Origin</label>
            <input class="form-control" id="visitorOrigin" name="origin" type="text" value="${escapeAttribute(item ? item.origin : '')}" required>
          </div>
          <div class="field">
            <label for="visitorDestination">Destination Record</label>
            <select class="form-control" id="visitorDestination" name="tourism_record">
              <option value="">Select destination</option>
              ${destinations}
            </select>
          </div>
          <div class="field">
            <label for="visitorPlace">Destination Name</label>
            <input class="form-control" id="visitorPlace" name="place" type="text" value="${escapeAttribute(item ? item.place : '')}" required>
          </div>
          <div class="field">
            <label for="visitorDate">Visit Date & Time</label>
            <input class="form-control" id="visitorDate" name="visit_date" type="datetime-local" value="${escapeAttribute(item ? toLocalInputValue(item.visit_date) : '')}" required>
          </div>
          <div class="field">
            <label for="visitorStatus">Status</label>
            <select class="form-control" id="visitorStatus" name="status">
              <option value="Checked In" ${!item || item.status === 'Checked In' ? 'selected' : ''}>Checked In</option>
              <option value="Checked Out" ${item && item.status === 'Checked Out' ? 'selected' : ''}>Checked Out</option>
            </select>
          </div>
        </div>
      `,
    };
  }

  function buildUserModal(item) {
    const roles = ['Admin', 'Manager', 'Encoder', 'Staff'];
    const statuses = ['Active', 'Inactive'];
    return {
      title: item ? 'Edit User' : 'Add User',
      subtitle: item ? 'Update staff account access and role.' : 'Create a new staff account.',
      body: `
        <div class="modal-grid">
          <div class="field">
            <label for="userName">Full Name</label>
            <input class="form-control" id="userName" name="name" type="text" value="${escapeAttribute(item ? item.name : '')}" required>
          </div>
          <div class="field">
            <label for="userUsername">Username</label>
            <input class="form-control" id="userUsername" name="username" type="text" value="${escapeAttribute(item ? item.username : '')}" required>
          </div>
          <div class="field">
            <label for="userEmail">Email</label>
            <input class="form-control" id="userEmail" name="email" type="email" value="${escapeAttribute(item ? item.email : '')}" required>
          </div>
          <div class="field">
            <label for="userOffice">Office</label>
            <input class="form-control" id="userOffice" name="office" type="text" value="${escapeAttribute(item ? item.office : '')}">
          </div>
          <div class="field">
            <label for="userRole">Role</label>
            <select class="form-control" id="userRole" name="role">
              ${roles.map((role) => `<option value="${role}" ${item && item.role === role ? 'selected' : ''}>${role}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="userStatus">Status</label>
            <select class="form-control" id="userStatus" name="status">
              ${statuses.map((statusValue) => `<option value="${statusValue}" ${(!item && statusValue === 'Active') || (item && item.status === statusValue) ? 'selected' : ''}>${statusValue}</option>`).join('')}
            </select>
          </div>
          <div class="field span-2">
            <label for="userPassword">${item ? 'New Password (optional)' : 'Password'}</label>
            <input class="form-control" id="userPassword" name="password" type="password" ${item ? '' : 'required'} placeholder="${item ? 'Leave blank to keep current password' : 'Set an initial password'}">
          </div>
        </div>
      `,
    };
  }

  function handleRecordImagePreview(event) {
    const file = event.target.files && event.target.files[0];
    const preview = document.getElementById('recordImagePreview');
    if (!preview || !file) return;

    const reader = new FileReader();
    reader.onload = () => {
      preview.innerHTML = `<img src="${reader.result}" alt="Selected preview">`;
    };
    reader.readAsDataURL(file);
  }

  function syncVisitorPlaceFromSelect(event) {
    const selectedId = Number(event.target.value);
    const selectedRecord = state.records.find((record) => Number(record.id) === selectedId);
    const placeInput = document.getElementById('visitorPlace');
    if (selectedRecord && placeInput) {
      placeInput.value = selectedRecord.name;
    }
  }

  async function handleEntitySubmit(event) {
    event.preventDefault();
    const entity = dom.entityForm.dataset.entity;
    const itemId = dom.entityForm.dataset.id;
    const isEditing = !!itemId;
    dom.saveModalBtn.disabled = true;

    try {
      if (entity === 'record') {
        const formData = new FormData(dom.entityForm);
        const file = formData.get('image_path');
        if (!(file && file.name)) {
          formData.delete('image_path');
        }
        await apiRequest(isEditing ? `/records/${itemId}/` : '/records/', {
          method: isEditing ? 'PATCH' : 'POST',
          body: formData,
        });
        showToast(isEditing ? 'Record updated' : 'Record added', 'Tourism record saved successfully.');
      }

      if (entity === 'visitor') {
        const formData = new FormData(dom.entityForm);
        const localDateTime = formData.get('visit_date');
        const payload = {
          name: String(formData.get('name') || '').trim(),
          origin: String(formData.get('origin') || '').trim(),
          place: String(formData.get('place') || '').trim(),
          visit_date: localDateTime ? new Date(localDateTime).toISOString() : null,
          status: formData.get('status'),
          tourism_record: formData.get('tourism_record') ? Number(formData.get('tourism_record')) : null,
        };
        await apiRequest(isEditing ? `/visitors/${itemId}/` : '/visitors/', {
          method: isEditing ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        });
        showToast(isEditing ? 'Visitor updated' : 'Visitor added', 'Visitor entry saved successfully.');
      }

      if (entity === 'user') {
        const formData = new FormData(dom.entityForm);
        const payload = {
          name: String(formData.get('name') || '').trim(),
          username: String(formData.get('username') || '').trim(),
          email: String(formData.get('email') || '').trim(),
          office: String(formData.get('office') || '').trim(),
          role: formData.get('role'),
          status: formData.get('status'),
        };
        const password = String(formData.get('password') || '').trim();
        if (password) {
          payload.password = password;
        }
        await apiRequest(isEditing ? `/users/${itemId}/` : '/users/', {
          method: isEditing ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        });
        showToast(isEditing ? 'User updated' : 'User added', 'Staff account saved successfully.');
      }

      closeModal();
      await refreshAllData();
    } catch (error) {
      showToast('Save failed', extractErrorMessage(error), 'fa-solid fa-triangle-exclamation');
    } finally {
      dom.saveModalBtn.disabled = false;
    }
  }

  function confirmClearLogs() {
    if (!canManageRecycle()) {
      showToast('Access denied', 'Only admins or managers can clear logs.', 'fa-solid fa-lock');
      return;
    }
    openConfirm({
      title: 'Clear activity logs',
      subtitle: 'This removes all existing log entries.',
      content: '<p>Are you sure you want to clear all activity logs?</p>',
      confirmText: 'Clear',
      onConfirm: async () => {
        try {
          await apiRequest('/activity-logs/clear/', { method: 'DELETE' });
          closeConfirm();
          showToast('Logs cleared', 'All activity logs were removed.');
          await refreshAllData();
        } catch (error) {
          showToast('Clear failed', error.message, 'fa-solid fa-triangle-exclamation');
        }
      },
    });
  }

  function confirmEmptyRecycleBin() {
    if (!canManageRecycle()) {
      showToast('Access denied', 'Only admins or managers can empty the recycle bin.', 'fa-solid fa-lock');
      return;
    }
    openConfirm({
      title: 'Empty recycle bin',
      subtitle: 'This permanently deletes all recoverable items.',
      content: '<p>Are you sure you want to empty the recycle bin?</p>',
      confirmText: 'Empty bin',
      onConfirm: async () => {
        try {
          await apiRequest('/recycle-bin/empty/', { method: 'DELETE' });
          closeConfirm();
          showToast('Recycle bin emptied', 'All deleted items were permanently removed.');
          await refreshAllData();
        } catch (error) {
          showToast('Empty failed', error.message, 'fa-solid fa-triangle-exclamation');
        }
      },
    });
  }

  async function downloadAuthenticatedFile(path, filename) {
    if (!state.token) {
      return;
    }
    try {
      const response = await fetch(`${getApiBase()}${path}`, {
        headers: {
          Authorization: `Token ${state.token}`,
        },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || 'Unable to download file.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast('Download ready', `${filename} has been downloaded.`);
    } catch (error) {
      showToast('Download failed', error.message, 'fa-solid fa-triangle-exclamation');
    }
  }

  function showToast(title, message, icon = 'fa-solid fa-circle-check') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="${icon}"></i>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
    dom.toastWrap.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  function buildEmptyState(message) {
    return `
      <div class="empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function buildEmptyTableRow(colspan, message) {
    return `<tr><td colspan="${colspan}">${buildEmptyState(message)}</td></tr>`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function capitalize(value) {
    return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function toLocalInputValue(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  function timeAgo(value) {
    if (!value) return 'now';
    const date = new Date(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function extractErrorMessage(error) {
    if (!error) return 'An unknown error occurred.';
    if (error.payload) {
      const payload = error.payload;
      if (typeof payload.detail === 'string') {
        return payload.detail;
      }
      const firstField = Object.keys(payload)[0];
      if (firstField) {
        const fieldValue = payload[firstField];
        if (Array.isArray(fieldValue)) {
          return fieldValue.join(' ');
        }
        if (typeof fieldValue === 'string') {
          return fieldValue;
        }
      }
    }
    return error.message || 'An unknown error occurred.';
  }

  function readItemName(itemData) {
    if (!itemData) return '';
    return itemData.name || itemData.username || itemData.email || itemData.place || '';
  }
})();
