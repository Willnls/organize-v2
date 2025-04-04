// Variáveis globais
let cards = [];
let draggedCard = null;

// Elementos do DOM
const board = document.getElementById('board');
const columns = document.querySelectorAll('.column');
const newTaskBtn = document.getElementById('newTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');

// Funções
async function fetchCards() {
    try {
        const response = await fetch('http://localhost:3000/api/cards');
        if (!response.ok) throw new Error('Falha ao buscar cards');

        const data = await response.json();
        if (data.success) {
            cards = data.data;
            renderCards();
            updateCounts();
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Falha ao carregar tarefas. Tente novamente.');
    }
}

function renderCards() {
    // Limpa todos os cards
    document.querySelectorAll('[id$="-cards"]').forEach(container => {
        container.innerHTML = '';
    });

    // Renderiza cada card na coluna apropriada
    cards.forEach(card => {
        const columnId = `${card.status}-cards`;
        const column = document.getElementById(columnId);
        if (column) {
            column.appendChild(createCardElement(card));
        }
    });
}

function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'bg-white p-4 rounded-lg shadow-sm card';
    cardElement.draggable = true;
    cardElement.dataset.id = card.id;

    // Mapeia prioridades para classes e textos
    const priorityMap = {
        high: { class: 'bg-red-100 text-red-600', text: 'Alta' },
        medium: { class: 'bg-yellow-100 text-yellow-600', text: 'Média' },
        low: { class: 'bg-green-100 text-green-600', text: 'Baixa' }
    };

    const priority = priorityMap[card.priority] || { class: 'bg-gray-100 text-gray-600', text: 'Sem prioridade' };

    cardElement.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <span class="px-2 py-1 text-xs ${priority.class} rounded">${priority.text}</span>
                    <div>
                        <button class="edit-btn text-gray-400 hover:text-blue-600 mr-2" data-id="${card.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn text-gray-400 hover:text-red-600" data-id="${card.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h4 class="font-medium mb-2">${card.title}</h4>
                <p class="text-sm text-gray-600 mb-4">${card.description || 'Sem descrição'}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                            ${card.assignee ? card.assignee.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span class="ml-2 text-sm text-gray-600">${card.assignee || 'Não atribuído'}</span>
                    </div>
                    <span class="text-sm ${card.status === 'done' ? 'text-gray-500' : 'text-blue-600'}">
                        ${card.status === 'done' ? 'Concluído' : (card.dueDate ? `Vence em ${new Date(card.dueDate).toLocaleDateString()}` : 'Sem data')}
                    </span>
                </div>
            `;

    // Adiciona eventos de drag
    cardElement.addEventListener('dragstart', handleDragStart);
    cardElement.addEventListener('dragend', handleDragEnd);

    return cardElement;
}

function updateCounts() {
    const counts = {
        'todo': 0,
        'in-progress': 0,
        'review': 0,
        'done': 0
    };

    cards.forEach(card => {
        counts[card.status]++;
    });

    Object.keys(counts).forEach(status => {
        const countElement = document.getElementById(`${status}-count`);
        if (countElement) {
            countElement.textContent = counts[status];
        }
    });
}

async function handleCardUpdate(cardId, updates) {
    try {
        const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Falha ao atualizar card');

        const data = await response.json();
        if (data.success) {
            fetchCards(); // Recarrega os cards
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Falha ao atualizar tarefa. Tente novamente.');
    }
}

async function handleCardDelete(cardId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Falha ao deletar card');

        const data = await response.json();
        if (data.success) {
            fetchCards(); // Recarrega os cards
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Falha ao excluir tarefa. Tente novamente.');
    }
}

async function handleCardCreate(newCard) {
    try {
        const response = await fetch('http://localhost:3000/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCard)
        });

        if (!response.ok) throw new Error('Falha ao criar card');

        const data = await response.json();
        if (data.success) {
            fetchCards(); // Recarrega os cards
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Falha ao criar tarefa. Tente novamente.');
    }
}

function openModal(card = null) {
    if (card) {
        // Modo edição
        modalTitle.textContent = 'Editar Tarefa';
        document.getElementById('cardId').value = card.id;
        document.getElementById('title').value = card.title;
        document.getElementById('description').value = card.description || '';
        document.getElementById('priority').value = card.priority || 'medium';
        document.getElementById('assignee').value = card.assignee || '';
        document.getElementById('dueDate').value = card.dueDate || '';
    } else {
        // Modo criação
        modalTitle.textContent = 'Nova Tarefa';
        taskForm.reset();
        document.getElementById('cardId').value = '';
    }
    taskModal.classList.remove('hidden');
}

// Event Handlers
function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedCard = null;
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drop-target');
}

function handleDragEnter(e) {
    e.preventDefault();
}

function handleDragLeave() {
    this.classList.remove('drop-target');
}

async function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drop-target');

    const cardId = e.dataTransfer.getData('text/plain');
    const newStatus = this.dataset.status;

    if (cardId && newStatus) {
        await handleCardUpdate(cardId, { status: newStatus });
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    const cardId = document.getElementById('cardId').value;
    const cardData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        priority: document.getElementById('priority').value,
        assignee: document.getElementById('assignee').value,
        dueDate: document.getElementById('dueDate').value
    };

    if (cardId) {
        // Editar card existente
        handleCardUpdate(cardId, cardData);
    } else {
        // Criar novo card
        cardData.status = 'todo'; // Novo card sempre começa como "todo"
        handleCardCreate(cardData);
    }

    taskModal.classList.add('hidden');
}

function handleClickOutsideModal(e) {
    if (e.target === taskModal) {
        taskModal.classList.add('hidden');
    }
}

function handleDocumentClick(e) {
    // Editar card
    if (e.target.closest('.edit-btn')) {
        const cardId = e.target.closest('.edit-btn').dataset.id;
        const card = cards.find(c => c.id === cardId);
        if (card) openModal(card);
    }

    // Excluir card
    if (e.target.closest('.delete-btn')) {
        const cardId = e.target.closest('.delete-btn').dataset.id;
        if (cardId) handleCardDelete(cardId);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchCards);

newTaskBtn.addEventListener('click', () => openModal());
closeModal.addEventListener('click', () => taskModal.classList.add('hidden'));
cancelBtn.addEventListener('click', () => taskModal.classList.add('hidden'));
taskModal.addEventListener('click', handleClickOutsideModal);
taskForm.addEventListener('submit', handleFormSubmit);
document.addEventListener('click', handleDocumentClick);

// Drag and Drop
columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('dragenter', handleDragEnter);
    column.addEventListener('dragleave', handleDragLeave);
    column.addEventListener('drop', handleDrop);
});