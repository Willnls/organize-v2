document.addEventListener('DOMContentLoaded', function() {
    // Estado do aplicativo
    const state = {
        currentDate: new Date(),
        activities: JSON.parse(localStorage.getItem('calendarActivities')) || {},
        draggedItem: null,
        editingActivity: null
    };

    // Elementos do DOM
    const elements = {
        calendarGrid: document.getElementById('calendar-grid'),
        currentMonthYear: document.getElementById('current-month-year'),
        prevMonthBtn: document.getElementById('prev-month'),
        nextMonthBtn: document.getElementById('next-month'),
        todayBtn: document.getElementById('today'),
        activityModal: document.getElementById('activity-modal'),
        activityForm: document.getElementById('activity-form'),
        modalTitle: document.getElementById('modal-title'),
        deleteActivityBtn: document.getElementById('delete-activity'),
        closeModalBtn: document.getElementById('close-modal'),
        cancelActivityBtn: document.getElementById('cancel-activity')
    };

    // Inicialização
    initCalendar();

    function initCalendar() {
        renderCalendar();
        setupEventListeners();
    }

    function renderCalendar() {
        elements.calendarGrid.innerHTML = '';

        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();
        elements.currentMonthYear.textContent = new Intl.DateTimeFormat('pt-BR', { 
            month: 'long', 
            year: 'numeric'
        }).format(state.currentDate).replace(/de /g, '');

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        // Dias vazios no início
        for (let i = 0; i < startDayOfWeek; i++) {
            createDayElement(null);
        }

        // Dias do mês
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            createDayElement(date, isCurrentMonth && day === today.getDate());
        }
    }

    function createDayElement(date, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (!date) {
            dayElement.classList.add('empty');
            elements.calendarGrid.appendChild(dayElement);
            return;
        }

        if (isToday) {
            dayElement.classList.add('today');
        }

        // Número do dia
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);

        // Atividades do dia
        const dateStr = formatDate(date);
        if (state.activities[dateStr]) {
            const activitiesContainer = document.createElement('div');
            activitiesContainer.className = 'activities-container';
            
            state.activities[dateStr].forEach((activity, index) => {
                const activityElement = createActivityElement(activity, dateStr, index);
                activitiesContainer.appendChild(activityElement);
            });
            
            dayElement.appendChild(activitiesContainer);
        }

        // Evento de clique para adicionar atividade
        dayElement.addEventListener('click', (e) => {
            if (e.target === dayElement || e.target === dayNumber) {
                openActivityModal(date);
            }
        });

        // Drag and drop
        dayElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            dayElement.classList.add('drop-target');
        });

        dayElement.addEventListener('dragleave', () => {
            dayElement.classList.remove('drop-target');
        });

        dayElement.addEventListener('drop', (e) => {
            e.preventDefault();
            dayElement.classList.remove('drop-target');
            
            if (state.draggedItem) {
                moveActivity(state.draggedItem.dateStr, dateStr, state.draggedItem.index);
            }
        });

        elements.calendarGrid.appendChild(dayElement);
    }

    function createActivityElement(activity, dateStr, index) {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.draggable = true;
        activityElement.innerHTML = `
            <span class="activity-time">${activity.time || ''}</span>
            <span>${activity.title}</span>
        `;

        if (activity.description) {
            activityElement.title = activity.description;
        }

        // Eventos de drag
        activityElement.addEventListener('dragstart', () => {
            state.draggedItem = { dateStr, index };
            activityElement.classList.add('dragging');
            setTimeout(() => activityElement.style.display = 'none', 0);
        });

        activityElement.addEventListener('dragend', () => {
            activityElement.classList.remove('dragging');
            activityElement.style.display = 'flex';
        });

        // Clique para editar
        activityElement.addEventListener('click', (e) => {
            e.stopPropagation();
            state.editingActivity = { activity, dateStr, index };
            openActivityModal(new Date(dateStr), activity);
        });

        return activityElement;
    }

    function openActivityModal(date, activity = null) {
        const dateStr = formatDate(date);
        
        if (activity) {
            // Modo edição
            elements.modalTitle.textContent = 'Editar Atividade';
            elements.deleteActivityBtn.classList.remove('hidden');
            
            document.getElementById('activity-id').value = activity.id || '';
            document.getElementById('activity-date').value = dateStr;
            document.getElementById('activity-title').value = activity.title;
            document.getElementById('activity-description').value = activity.description || '';
            document.getElementById('activity-time').value = activity.time || '';
        } else {
            // Modo criação
            elements.modalTitle.textContent = 'Adicionar Atividade';
            elements.deleteActivityBtn.classList.add('hidden');
            
            document.getElementById('activity-id').value = '';
            document.getElementById('activity-date').value = dateStr;
            document.getElementById('activity-title').value = '';
            document.getElementById('activity-description').value = '';
            document.getElementById('activity-time').value = '';
        }
        
        elements.activityModal.classList.remove('hidden');
        document.getElementById('activity-title').focus();
    }

    function moveActivity(fromDate, toDate, index) {
        if (!state.activities[fromDate] || !state.activities[fromDate][index]) return;

        const activity = state.activities[fromDate][index];
        
        // Remover da origem
        state.activities[fromDate].splice(index, 1);
        if (state.activities[fromDate].length === 0) {
            delete state.activities[fromDate];
        }
        
        // Adicionar no destino
        if (!state.activities[toDate]) {
            state.activities[toDate] = [];
        }
        
        state.activities[toDate].push(activity);
        state.activities[toDate].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        
        saveActivities();
        renderCalendar();
    }

    function setupEventListeners() {
        // Navegação do calendário
        elements.prevMonthBtn.addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        elements.nextMonthBtn.addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() + 1);
            renderCalendar();
        });
        
        elements.todayBtn.addEventListener('click', () => {
            state.currentDate = new Date();
            renderCalendar();
        });

        // Modal
        elements.activityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit();
        });
        
        elements.closeModalBtn.addEventListener('click', closeModal);
        elements.cancelActivityBtn.addEventListener('click', closeModal);
        elements.deleteActivityBtn.addEventListener('click', deleteActivity);
        
        // Fechar modal ao clicar fora
        elements.activityModal.addEventListener('click', (e) => {
            if (e.target === elements.activityModal) {
                closeModal();
            }
        });
    }

    function handleFormSubmit() {
        const id = document.getElementById('activity-id').value;
        const date = document.getElementById('activity-date').value;
        const title = document.getElementById('activity-title').value.trim();
        const description = document.getElementById('activity-description').value.trim();
        const time = document.getElementById('activity-time').value;

        if (!title) {
            alert('O título é obrigatório');
            return;
        }

        const activity = { 
            title, 
            description, 
            time,
            id: id || generateId()
        };

        if (state.editingActivity) {
            // Remover atividade antiga
            const { dateStr, index } = state.editingActivity;
            state.activities[dateStr].splice(index, 1);
            if (state.activities[dateStr].length === 0) {
                delete state.activities[dateStr];
            }
            state.editingActivity = null;
        }

        // Adicionar nova atividade
        if (!state.activities[date]) {
            state.activities[date] = [];
        }
        
        state.activities[date].push(activity);
        state.activities[date].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        saveActivities();
        renderCalendar();
        closeModal();
    }

    function deleteActivity() {
        if (!state.editingActivity) return;

        const { dateStr, index } = state.editingActivity;
        state.activities[dateStr].splice(index, 1);
        
        if (state.activities[dateStr].length === 0) {
            delete state.activities[dateStr];
        }
        
        saveActivities();
        renderCalendar();
        closeModal();
        state.editingActivity = null;
    }

    function closeModal() {
        elements.activityModal.classList.add('hidden');
        elements.activityForm.reset();
        state.editingActivity = null;
    }

    function saveActivities() {
        localStorage.setItem('calendarActivities', JSON.stringify(state.activities));
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
});