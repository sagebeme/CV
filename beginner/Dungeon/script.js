class MiniDungeon {
  constructor() {
    this.gridWidth = window.innerWidth <= 480 ? 5 : window.innerWidth <= 768 ? 6 : 8
    this.gridHeight = window.innerWidth <= 480 ? 6 : window.innerWidth <= 768 ? 8 : 6
    this.playerX = 0
    this.playerY = 0
    this.health = 100
    this.gold = 0
    this.score = 0
    this.visitedRooms = new Set()
    this.roomTypes = {}
    this.eventLog = []

    this.init()
  }

  init() {
    this.generateDungeon()
    this.render()
    this.addEventListeners()
    this.visitedRooms.add(`${this.playerX},${this.playerY}`)
    this.updateStats()
  }

  generateDungeon() {
    // Generate random room types
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (x === 0 && y === 0) continue // Starting position is always safe

        const rand = Math.random()
        if (rand < 0.15) {
          this.roomTypes[`${x},${y}`] = "trap"
        } else if (rand < 0.25) {
          this.roomTypes[`${x},${y}`] = "treasure"
        } else if (rand < 0.35) {
          this.roomTypes[`${x},${y}`] = "enemy"
        }
      }
    }
  }

  render() {
    const grid = document.getElementById("dungeonGrid")
    grid.innerHTML = ""
    grid.style.gridTemplateColumns = `repeat(${this.gridWidth}, 1fr)`
    grid.style.gridTemplateRows = `repeat(${this.gridHeight}, 1fr)`

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const room = document.createElement("div")
        room.className = "room"
        room.dataset.x = x
        room.dataset.y = y

        const roomKey = `${x},${y}`
        const isVisited = this.visitedRooms.has(roomKey)
        const isCurrent = x === this.playerX && y === this.playerY

        if (isCurrent) {
          room.classList.add("current")
          room.innerHTML = '<span class="player">🧙‍♂️</span>'
        } else if (isVisited) {
          room.classList.add("visited")
          const roomType = this.roomTypes[roomKey]
          if (roomType === "trap") {
            room.classList.add("trap")
            room.innerHTML = "💀"
          } else if (roomType === "treasure") {
            room.classList.add("treasure")
            room.innerHTML = "💰"
          } else if (roomType === "enemy") {
            room.classList.add("enemy")
            room.innerHTML = "👹"
          } else {
            room.innerHTML = "✨"
          }
        } else {
          room.innerHTML = "❓"
        }

        grid.appendChild(room)
      }
    }
  }

  movePlayer(dx, dy) {
    const newX = this.playerX + dx
    const newY = this.playerY + dy

    // Check boundaries
    if (newX < 0 || newX >= this.gridWidth || newY < 0 || newY >= this.gridHeight) {
      this.addEvent("🚫 Cannot move there - dungeon wall!", "move")
      this.shakeGrid()
      return
    }

    this.playerX = newX
    this.playerY = newY

    const roomKey = `${this.playerX},${this.playerY}`
    const isNewRoom = !this.visitedRooms.has(roomKey)

    if (isNewRoom) {
      this.visitedRooms.add(roomKey)
      this.handleRoomEvent(roomKey)
      this.score += 10
    } else {
      this.addEvent(`🚶 Moved to (${this.playerX}, ${this.playerY})`, "move")
    }

    this.render()
    this.updateStats()
  }

  handleRoomEvent(roomKey) {
    const roomType = this.roomTypes[roomKey]

    switch (roomType) {
      case "trap":
        const damage = Math.floor(Math.random() * 30) + 10
        this.health = Math.max(0, this.health - damage)
        this.addEvent(`💀 Trap! Lost ${damage} health!`, "trap")
        this.shakeGrid()
        if (this.health <= 0) {
          this.addEvent("💀 Game Over! You died in the dungeon!", "trap")
        }
        break

      case "treasure":
        const goldFound = Math.floor(Math.random() * 50) + 20
        this.gold += goldFound
        this.score += goldFound * 2
        this.addEvent(`💰 Treasure! Found ${goldFound} gold!`, "treasure")
        break

      case "enemy":
        const enemyDamage = Math.floor(Math.random() * 20) + 5
        const goldStolen = Math.floor(Math.random() * 15) + 5
        this.health = Math.max(0, this.health - enemyDamage)
        this.gold = Math.max(0, this.gold - goldStolen)
        this.score += 25 // Bonus for surviving enemy encounter
        this.addEvent(`👹 Enemy! Lost ${enemyDamage} health and ${goldStolen} gold!`, "enemy")
        this.shakeGrid()
        break

      default:
        this.addEvent(`✨ Empty room. Safe to rest here.`, "move")
        // Small health recovery in empty rooms
        this.health = Math.min(100, this.health + 5)
        break
    }
  }

  addEvent(message, type) {
    const eventLog = document.getElementById("eventLog")
    const event = document.createElement("div")
    event.className = `event ${type}`
    event.textContent = message
    eventLog.appendChild(event)
    eventLog.scrollTop = eventLog.scrollHeight

    // Keep only last 10 events
    while (eventLog.children.length > 10) {
      eventLog.removeChild(eventLog.firstChild)
    }
  }

  shakeGrid() {
    const grid = document.getElementById("dungeonGrid")
    grid.classList.add("shake")
    setTimeout(() => grid.classList.remove("shake"), 500)
  }

  updateStats() {
    document.getElementById("health").textContent = this.health
    document.getElementById("gold").textContent = this.gold
    document.getElementById("score").textContent = this.score
    document.getElementById("position").textContent = `(${this.playerX}, ${this.playerY})`
  }

  addEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (this.health <= 0) return

      const key = document.querySelector(`[data-key="${e.code}"]`)
      if (key) {
        key.classList.add("active")
        setTimeout(() => key.classList.remove("active"), 150)
      }

      switch (e.code) {
        case "ArrowUp":
          e.preventDefault()
          this.movePlayer(0, -1)
          break
        case "ArrowDown":
          e.preventDefault()
          this.movePlayer(0, 1)
          break
        case "ArrowLeft":
          e.preventDefault()
          this.movePlayer(-1, 0)
          break
        case "ArrowRight":
          e.preventDefault()
          this.movePlayer(1, 0)
          break
      }
    })

    // Touch controls for mobile
    let touchStartX = 0
    let touchStartY = 0

    document.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    })

    document.addEventListener("touchend", (e) => {
      if (this.health <= 0) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > 30) {
          this.movePlayer(deltaX > 0 ? 1 : -1, 0)
        }
      } else {
        if (Math.abs(deltaY) > 30) {
          this.movePlayer(0, deltaY > 0 ? 1 : -1)
        }
      }
    })
  }

  reset() {
    this.playerX = 0
    this.playerY = 0
    this.health = 100
    this.gold = 0
    this.score = 0
    this.visitedRooms.clear()
    this.roomTypes = {}

    // Clear event log
    const eventLog = document.getElementById("eventLog")
    eventLog.innerHTML = '<div class="event move">🚀 New adventure begins! Use arrow keys to explore.</div>'

    this.generateDungeon()
    this.visitedRooms.add(`${this.playerX},${this.playerY}`)
    this.render()
    this.updateStats()
  }
}

// Initialize game
let game = new MiniDungeon()

function resetGame() {
  game.reset()
}

// Handle window resize
window.addEventListener("resize", () => {
  const newGridWidth = window.innerWidth <= 480 ? 5 : window.innerWidth <= 768 ? 6 : 8
  const newGridHeight = window.innerWidth <= 480 ? 6 : window.innerWidth <= 768 ? 8 : 6

  if (newGridWidth !== game.gridWidth || newGridHeight !== game.gridHeight) {
    game = new MiniDungeon()
  }
})


