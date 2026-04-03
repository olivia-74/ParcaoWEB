// pseudo-database

const DB_USER = 'parcao_user';
const DB_USERS_LIST = 'parcao_users_list';
const DB_RES = 'parcao_reservations';

function getAllUsers() {
  return JSON.parse(localStorage.getItem(DB_USERS_LIST)) || [];
}

function getUser() {
  return JSON.parse(localStorage.getItem(DB_USER));
}

function setUser(userObj) {
  localStorage.setItem(DB_USER, JSON.stringify(userObj));
}

function logout() {
  localStorage.removeItem(DB_USER); window.location.href = 'index.html';
}

function getReservations() {
  return JSON.parse(localStorage.getItem(DB_RES)) || [];
}

function saveReservation(resData) {
  const allRes = getReservations();
  allRes.push({
    id: 'r' + Date.now(),
    userId: getUser().id,
    userName: getUser().name,
    status: 'active',
    ...resData
  });
  localStorage.setItem(DB_RES, JSON.stringify(allRes));
}

function cancelReservation(id) {
  const allRes = getReservations();
  const resIndex = allRes.findIndex(r => r.id === id);
  if (resIndex > -1) {
    allRes[resIndex].status = 'cancelled';
    localStorage.setItem(DB_RES, JSON.stringify(allRes));
  }
}

const QUADRAS = [
  { id: 1, name: 'Campo de Futebol 1', emoji: '⚽', img: 'images/soccer-field-1.jpg'},
  { id: 2, name: 'Campo de Futebol 2', emoji: '⚽', img: 'images/soccer-field-2.jpg'},
  { id: 3, name: 'Quadra 1 - Basquete', emoji: '🏀', img: 'images/basketball-court.jpg'},
  { id: 4, name: 'Quadra 2 - Poliesportiva', emoji: '🏐', img: 'images/multi-sports-court-2.jpg' },
  { id: 5, name: 'Quadra 3 - Poliesportiva', emoji: '🏐', img: 'images/multi-sports-court-3.jpg' },
];

const currentPage = window.location.pathname;
const publicPages = ['/', '/index.html', '/login.html'];
const isPublicPage = publicPages.some(p => currentPage.endsWith(p));

if (!getUser() && !isPublicPage) {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();


  const nameDisplay = document.getElementById('users-name');
  if (nameDisplay && user) {
    nameDisplay.textContent = user.name.split(' ')[0];
  }
  
  const fullnameDisplay = document.getElementById('user-fullname');
  if (fullnameDisplay && user) {
    fullnameDisplay.textContent = user.name;
  }
  
  const avatarDisplay = document.getElementById('user-avatar');
  if (avatarDisplay && user) {
    avatarDisplay.textContent = user.name.charAt(0).toUpperCase();
  }

  // login and signin
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const loginTab = document.getElementById('tab-login-button');
  const registerTab = document.getElementById('tab-register-button');

  if (loginTab && registerTab && loginForm && registerForm) { 
    function showLogin() {
      loginTab.classList.add('on');
      registerTab.classList.remove('on');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    }

    function showRegister() {
      loginTab.classList.remove('on');
      registerTab.classList.add('on');
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    }

    loginTab.addEventListener('click', showLogin);
    registerTab.addEventListener('click', showRegister);

    // Define o estado inicial com base no parâmetro da URL
    const isRegister = new URLSearchParams(window.location.search).get('tab') === 'register';
    if (isRegister) {
      showRegister();
    } else {
      showLogin();
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      if (!email || !password) {  
        alert('Por favor, preencha o e-mail e a senha.');
        return;
      }
      
      const allUsers = getAllUsers();
      const registeredUser = allUsers.find(u => u.email === email);
      
      const userName = registeredUser.name.split(' ')[0]; 
      
      setUser({ id: email, name: userName, email: email });
      window.location.href = 'dashboard.html';
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      if (!name || !email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      if (password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      const allUsers = getAllUsers();
      const userExists = allUsers.find(u => u.email === email);
      if (userExists) {
        alert('Este e-mail já está cadastrado!');
        return;
      }
      
      allUsers.push({ id: email, name: name, email: email, password: password });
      localStorage.setItem(DB_USERS_LIST, JSON.stringify(allUsers));

      setUser({ id: email, name: name, email: email });
      window.location.href = 'dashboard.html';
    });
  }

// dashboard das quadras
  const courtDashboard = document.getElementById('court-grid');
  if (courtDashboard) {
    function renderQuadras() {
      const reservas = getReservations();
      const agora = Date.now();
      let card = '';

      // q = quadra/court
      // r = reserva/reservation
      QUADRAS.forEach(q => {
        
        const resAtiva = reservas.find(r =>
          r.quadraId === q.id &&
          r.status === 'active' &&
          r.startTime + (r.durationHours * 3600000) > agora
        );

        card += `
          <div class="court-card">
            <div class="court-image-wrap">
              <img src="${q.img}" class="court-image" alt="${q.name}"/>
              <div class="court-badge ${resAtiva ? 'busy' : 'free'}"> 
                ${resAtiva ? 'Ocupada' : 'Livre'}
              </div>
              <div class="court-badge-sport">${q.emoji}</div>
              <div class="court-image-info">
                <h3>${q.name}</h3>
              </div>
            </div>
            <div class="court-card-footer">
              ${resAtiva ? `
                <div class="booked-court-row">
                  <div class="booked-court-info">
                    <div class="booked-court-avatar">${resAtiva.userName.charAt(0).toUpperCase()}</div>
                    <div><div class="booked-court-name">${resAtiva.userName}</div><div class="booked-court-label">reservou esta quadra</div></div>
                  </div>
                </div>
                <button class="button-cancel" disabled style="opacity: 0.5; cursor: not-allowed; width: 100%;">Indisponível no momento</button>
              ` : `
                <div class="free-court-row"> 
                  <div><div class="free-court-heading">Disponível agora!</div><div class="free-court-subheading">Nenhuma reserva ativa</div></div>
                </div>
                <a href="reserva.html?quadra=${q.id}" class="green-button">Reservar agora</a>
              `}
            </div>
          </div>
        `;
      });
      courtDashboard.innerHTML = card;
    }
    
    renderQuadras();
    setInterval(renderQuadras, 30000); 
  }

  // criar reserva 

  const reserveForm = document.getElementById('form-reserve');
  if (reserveForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const quadraId = parseInt(urlParams.get('quadra'));
    const quadra = QUADRAS.find(q => q.id === quadraId);
    
    if (quadra) {
      document.getElementById('nome-quadra-reserva').textContent = quadra.name;
    }
    
      const durationButtons = document.querySelectorAll('.reservation-duration-button');
      const reservDuration = document.getElementById('reserv-duration');
      durationButtons.forEach(button => {
        button.addEventListener('click', () => {
          durationButtons.forEach(b => b.classList.remove('on'));
          button.classList.add('on');
          reservDuration.value = button.getAttribute('data-val');
        });
      });

      const togBola = document.getElementById('reservation-toggle-bola');
      const resBola = document.getElementById('reserv-ball');
      togBola.addEventListener('click', () => { 
        resBola.checked = !resBola.checked;
        togBola.classList.toggle('on', resBola.checked);
      });

      const togMore = document.getElementById('reservation-toggle-more');
      const resMore = document.getElementById('reserv-more');
      const moreSec = document.getElementById('more-sec');
      const toggleRowMore = document.getElementById('reservation-toggle-row-more');
      togMore.addEventListener('click', () => {
        resMore.checked = !resMore.checked;
        togMore.classList.toggle('on', resMore.checked);
        moreSec.style.display = resMore.checked ? 'block' : 'none';
        toggleRowMore.style.marginBottom = resMore.checked ? '16px' : '0';
      });

      const updateVal = (idRes, idVal, val) => {
        document.getElementById(idRes).value = val;
        document.getElementById(idVal).textContent = val;
      };

      document.getElementById('button-players-dec').addEventListener('click', () => {
        let val = parseInt(document.getElementById('reserv-people').value);
        if (val > 0) { updateVal('reserv-people', 'val-pessoas', val - 1); updatePessoasLabel(val - 1); }
      });
      document.getElementById('button-players-inc').addEventListener('click', () => {
        let val = parseInt(document.getElementById('reserv-people').value);
        if (val < 19) { updateVal('reserv-people', 'val-pessoas', val + 1); updatePessoasLabel(val + 1); }
      });
      const updatePessoasLabel = (val) => {
        const total = val + 1;
        document.getElementById('total-pessoas').textContent = total + (total !== 1 ? ' pessoas' : ' pessoa');
      };

      document.getElementById('button-maxpeople-dec').addEventListener('click', () => {
        let val = parseInt(document.getElementById('reserv-max-people').value);
        let minAllowed = parseInt(document.getElementById('reserv-people').value) + 2;
        if (val > minAllowed) updateVal('reserv-max-people', 'val-max-pessoas', val - 1);
      });
      document.getElementById('button-maxpeople-inc').addEventListener('click', () => {
        let val = parseInt(document.getElementById('reserv-max-people').value);
        if (val < 30) updateVal('reserv-max-people', 'val-max-pessoas', val + 1);
      });

      document.getElementById('reserv-mail').addEventListener('change', (e) => {
        document.getElementById('reservation-mail-label').classList.toggle('on', e.target.checked);
      });
      document.getElementById('reserv-invite-text').addEventListener('input', (e) => {
        document.getElementById('reservation-message-textarea-container').textContent = `${e.target.value.length}/200`;
      });

    // form fields
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const duracao = parseFloat(document.getElementById('reserv-duration').value);
      const temBola = document.getElementById('reserv-ball').checked;
      const nota = document.getElementById('reserv-invite-text') ? document.getElementById('reserv-invite-text').value : '';
      const morePlayers = document.getElementById('reserv-more') ? document.getElementById('reserv-more').checked : false;
      const playersWithMe = document.getElementById('reserv-people') ? parseInt(document.getElementById('reserv-people').value) : 0;
      const maxPlayers = document.getElementById('reserv-max-people') ? parseInt(document.getElementById('reserv-max-people').value) : null;
      const mail = document.getElementById('reserv-mail') ? document.getElementById('reserv-mail').checked : false;
      
      saveReservation({ 
        quadraId: quadraId, 
        startTime: Date.now(), 
        durationHours: duracao, 
        hasBall: temBola,
        note: morePlayers ? nota : '',
        playersWithMe: playersWithMe,
        maxPlayers: morePlayers ? maxPlayers : null,
        morePlayersPlayers: morePlayers,
        mailNotify: morePlayers ? mail : false
      });
      
      window.location.href = 'minhas-reservas.html';
    });
  }

  // minhas reservas

  const listaMinhasReservas = document.getElementById('lista-reservas');
  if (listaMinhasReservas) {
    const minhasReservas = getReservations()
      .filter(r => r.userId === getUser().id)
      .sort((a,b) => b.startTime - a.startTime);
    
    if (minhasReservas.length === 0) {
      listaMinhasReservas.innerHTML = `
        <div style="background:#fff; border-radius:16px; border:1px solid #E5E7EB; padding:40px; text-align:center;">
          <p style="color:#6B7280; font-size:15px;">Você não tem nenhuma reserva.</p>
          <a href="dashboard.html" class="green-button" style="max-width:200px; margin: 16px auto 0;">Ver Quadras</a>
        </div>
      `;
    } else {
      let html = '';
      minhasReservas.forEach(r => {
        const quadra = QUADRAS.find(q => q.id === r.quadraId);
        const statusColor = r.status === 'active' ? '#16A34A' : '#6B7280';
        const statusText = r.status === 'active' ? 'Ativa' : 'Cancelada';
        const bgStatus = r.status === 'active' ? 'rgba(34,197,94,.1)' : '#F3F4F6';
        
        html += `
          <div class="myreservation-card" style="flex-direction: row; flex-wrap: wrap; gap: 16px; align-items: center;">
            <img src="${quadra.img}" style="width: 70px; height: 70px; border-radius: 12px; object-fit: cover; flex-shrink: 0;" alt="${quadra.name}" />
            <div style="flex: 1; min-width: 200px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4>${quadra.emoji} ${quadra.name}</h4>
                <span style="background:${bgStatus}; color:${statusColor}; padding:4px 10px; border-radius:100px; font-size:11px; font-weight:700;">${statusText}</span>
              </div>
              <p style="margin-top:8px;"><strong>Duração:</strong> ${r.durationHours}h</p>
              <p><strong>Data:</strong> ${new Date(r.startTime).toLocaleDateString('pt-BR')} às ${new Date(r.startTime).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
              ${r.status === 'active' ? `<button class="button-cancel" onclick="window.cancelar('${r.id}')" style="max-width:200px; margin-top:12px;">Cancelar Reserva</button>` : ''}
            </div>
          </div>
        `;
      });
      listaMinhasReservas.innerHTML = html;
    }
  }
});

window.cancelar = function(id) {
  if (confirm('Tem certeza que deseja cancelar essa reserva? A quadra voltará a ficar disponível para outras pessoas.')) {
    cancelReservation(id);
    window.location.reload();
  }
};