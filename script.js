document.addEventListener('DOMContentLoaded', function() {

    const vendorSelect = document.getElementById('vendor');
    const queueInfo = document.getElementById('queueInfo');
    const joinQueueBtn = document.getElementById('joinQueueBtn');
    const ticketDisplay = document.getElementById('ticketDisplay');
    const activeQueueCard = document.getElementById('activeQueueCard');
    const leaveQueueBtn = document.getElementById('leaveQueueBtn');
    const activeLeaveQueueBtn = document.getElementById('activeLeaveQueueBtn');
    
   
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationCount = document.getElementById('notificationCount');
    const notificationList = document.getElementById('notificationList');
    const clearNotificationsBtn = document.getElementById('clearNotifications');
    
  
    const queueCards = document.querySelectorAll('.queue-card');
    
  
    const vendors = {
        'college-canteen': {
            name: 'College Canteen',
            waitTime: 15,
            queueLength: 8,
            description: 'Main campus food service'
        },
        'bus-stand': {
            name: 'Central Bus Stand',
            waitTime: 20,
            queueLength: 12,
            description: 'Public transportation hub'
        },
        'health-clinic': {
            name: 'Hospital',
            waitTime: 25,
            queueLength: 5,
            description: 'Health services'
        },
        'library': {
            name: 'University Library',
            waitTime: 0,
            queueLength: 0,
            description: 'Book checkouts & returns',
            closed: true
        }
    };
    

    let currentQueue = null;
    let queuePosition = 0;
    let totalQueueLength = 0;
    let notifications = [];
    let queueUpdateInterval = null;
    
 
    init();
    
    function init() {
      
        addEventListeners();
        
       
        updateNotificationUI();
        
       
        setTimeout(() => {
            addNotification('Welcome to WaitLess! Join a queue to get started.', 'info');
        }, 1000);
    }
    
    function addEventListeners() {
    
        vendorSelect.addEventListener('change', handleVendorChange);
        
      
        joinQueueBtn.addEventListener('click', handleJoinQueue);
        
  
        leaveQueueBtn.addEventListener('click', handleLeaveQueue);
        activeLeaveQueueBtn.addEventListener('click', handleLeaveQueue);
        
      
        notificationBtn.addEventListener('click', toggleNotificationDropdown);
        clearNotificationsBtn.addEventListener('click', clearAllNotifications);
        
   
        queueCards.forEach(card => {
            card.addEventListener('click', handleQueueCardClick);
        });
        
     
        document.addEventListener('click', handleOutsideClick);
    }
    
    function handleVendorChange() {
        const selectedVendor = vendorSelect.value;
        
        if (selectedVendor && vendors[selectedVendor]) {
            const vendor = vendors[selectedVendor];
            
    
            document.getElementById('queueName').textContent = vendor.name + ' Queue';
            document.getElementById('waitTime').textContent = vendor.waitTime;
            document.getElementById('queueLength').textContent = vendor.queueLength;
            
         
            queueInfo.classList.remove('hidden');
            
 
            if (vendor.closed) {
                joinQueueBtn.disabled = true;
                joinQueueBtn.innerHTML = '<i class="fas fa-times-circle"></i> Currently Closed';
                joinQueueBtn.classList.add('btn-disabled');
            } else {
                joinQueueBtn.disabled = false;
                joinQueueBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Get Queue Ticket';
                joinQueueBtn.classList.remove('btn-disabled');
            }
        } else {
            queueInfo.classList.add('hidden');
        }
    }
    
    function handleJoinQueue() {
        const userName = document.getElementById('userName').value.trim();
        const userPhone = document.getElementById('userPhone').value.trim();
        const selectedVendor = vendorSelect.value;
        
   
        if (!userName || !userPhone) {
            addNotification('Please enter your name and phone number.', 'error');
            return;
        }
        
        if (!selectedVendor) {
            addNotification('Please select a vendor.', 'error');
            return;
        }
        
        if (!isValidPhone(userPhone)) {
            addNotification('Please enter a valid phone number.', 'error');
            return;
        }
        
        const vendor = vendors[selectedVendor];
        
        if (vendor.closed) {
            addNotification('This venue is currently closed.', 'error');
            return;
        }
        

        joinQueue(selectedVendor, userName, userPhone);
    }
    
    function joinQueue(vendorKey, userName, userPhone) {
        const vendor = vendors[vendorKey];
        
   
        currentQueue = {
            vendor: vendorKey,
            vendorName: vendor.name,
            userName: userName,
            userPhone: userPhone,
            joinedAt: new Date()
        };
        
        queuePosition = vendor.queueLength + 1;
        totalQueueLength = queuePosition;
        
     
        updateTicketDisplay();
        
 
        ticketDisplay.classList.remove('hidden');
        queueInfo.classList.add('hidden');
        
       
        updateActiveQueueCard();
        activeQueueCard.classList.remove('hidden');
        
      
        addNotification(`You joined the queue for ${vendor.name}. Your position: ${queuePosition}`, 'success');
        
 
        startQueueSimulation();
    }
    
    function handleLeaveQueue() {
        if (!currentQueue) return;
        
        const vendorName = currentQueue.vendorName;
        
 
        currentQueue = null;
        queuePosition = 0;
        totalQueueLength = 0;
        
     
        stopQueueSimulation();
        

        ticketDisplay.classList.add('hidden');
        activeQueueCard.classList.add('hidden');
        
     
        if (vendorSelect.value) {
            queueInfo.classList.remove('hidden');
        }
        

        document.getElementById('userName').value = '';
        document.getElementById('userPhone').value = '';
        
     
        addNotification(`You left the queue for ${vendorName}.`, 'info');
    }
    
    function handleQueueCardClick(event) {
        const card = event.currentTarget;
        const vendor = card.dataset.vendor;
        
        if (vendor && vendors[vendor]) {
            vendorSelect.value = vendor;
            handleVendorChange();
        }
    }
    
    function updateTicketDisplay() {
        if (!currentQueue) return;
        
        const vendor = vendors[currentQueue.vendor];
        
      
        document.getElementById('ticketVendor').textContent = vendor.name;
        document.getElementById('ticketNumber').textContent = queuePosition;
        document.getElementById('positionText').textContent = `${queuePosition} in queue`;
        document.getElementById('joinedTime').textContent = formatTime(currentQueue.joinedAt);
        
  
        updateQueueProgress();
    }
    
    function updateActiveQueueCard() {
        if (!currentQueue) return;
        
        const vendor = vendors[currentQueue.vendor];
        
        document.getElementById('activeQueueName').textContent = vendor.name;
        document.getElementById('activeQueuePosition').textContent = queuePosition;
        
        updateQueueProgress();
    }
    
    function updateQueueProgress() {
        if (!currentQueue) return;
        
      
        const progressPercent = Math.max(0, ((totalQueueLength - queuePosition + 1) / totalQueueLength) * 100);
        
  
        const progressBar = document.getElementById('progressBar');
        const activeProgressBar = document.getElementById('activeQueueProgress');
        
        if (progressBar) {
            progressBar.style.width = progressPercent + '%';
        }
        
        if (activeProgressBar) {
            activeProgressBar.style.width = progressPercent + '%';
        }
        
      
        const vendor = vendors[currentQueue.vendor];
        const estimatedWait = Math.max(1, Math.round(vendor.waitTime * (queuePosition / totalQueueLength)));
        
    
        document.getElementById('estimatedWait').textContent = `~${estimatedWait} min`;
        document.getElementById('activeQueueWait').textContent = `~${estimatedWait} min`;
    }
    
    function startQueueSimulation() {
        if (queueUpdateInterval) {
            clearInterval(queueUpdateInterval);
        }
        
        queueUpdateInterval = setInterval(() => {
            if (!currentQueue || queuePosition <= 0) {
                stopQueueSimulation();
                return;
            }
            
          
            if (queuePosition > 1) {
                queuePosition--;
                
               
                updateTicketDisplay();
                updateActiveQueueCard();
                
              
                if (queuePosition % 3 === 0 || queuePosition <= 2) {
                    const message = queuePosition === 1 
                        ? `You are next in line at ${currentQueue.vendorName}! Please proceed.`
                        : `Your position in ${currentQueue.vendorName} queue is now ${queuePosition}`;
                    
                    addNotification(message, queuePosition === 1 ? 'success' : 'info');
                }
            }
        }, 8000); 
    }
    
    function stopQueueSimulation() {
        if (queueUpdateInterval) {
            clearInterval(queueUpdateInterval);
            queueUpdateInterval = null;
        }
    }
    
   
    function toggleNotificationDropdown() {
        notificationDropdown.classList.toggle('hidden');
    }
    
    function handleOutsideClick(event) {
        if (!notificationBtn.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.add('hidden');
        }
    }
    
    function addNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message: message,
            type: type,
            time: new Date(),
            read: false
        };
        
        notifications.unshift(notification);
        
   
        if (notifications.length > 50) {
            notifications = notifications.slice(0, 50);
        }
        
        updateNotificationUI();
        
     
        setTimeout(() => {
            notificationDropdown.classList.add('hidden');
        }, 3000);
    }
    
    function updateNotificationUI() {
 
        const unreadCount = notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            notificationCount.textContent = unreadCount > 99 ? '99+' : unreadCount;
            notificationCount.classList.remove('hidden');
        } else {
            notificationCount.classList.add('hidden');
        }
        

        updateNotificationList();
    }
    
    function updateNotificationList() {
        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="empty-notifications">No notifications</div>';
            return;
        }
        
        notificationList.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification-item';
            
            if (!notification.read) {
                notificationElement.classList.add('unread');
            }
            
            notificationElement.innerHTML = `
                <div class="notification-content">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${formatTime(notification.time)}</div>
                </div>
            `;
            
            notificationElement.addEventListener('click', () => {
                notification.read = true;
                updateNotificationUI();
            });
            
            notificationList.appendChild(notificationElement);
        });
    }
    
    function clearAllNotifications() {
        notifications = [];
        updateNotificationUI();
        notificationDropdown.classList.add('hidden');
    }
    
  
    function isValidPhone(phone) {
     
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    function formatTime(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
   
    window.addEventListener('beforeunload', () => {
        stopQueueSimulation();
    });
});
