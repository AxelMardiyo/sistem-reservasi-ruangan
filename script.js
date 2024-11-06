// Mendefinisikan data rooms awal
let rooms = [
  { number: "101", capacity: 30, reserved: [] },
  { number: "102", capacity: 25, reserved: [] },
  { number: "103", capacity: 20, reserved: [] },
];

const roomList = document.getElementById("roomList");
const reservationList = document.getElementById("reservationList");
const roomSelect = document.getElementById("roomNumber");
const reservationForm = document.getElementById("reservationForm");

// Menyimpan data ke localStorage
function saveToLocalStorage() {
  localStorage.setItem("rooms", JSON.stringify(rooms));
}

// Memuat data dari localStorage
function loadFromLocalStorage() {
  const storedRooms = localStorage.getItem("rooms");
  if (storedRooms) {
    rooms = JSON.parse(storedRooms);
  }
}

// Menampilkan daftar ruangan
function displayRooms() {
  roomList.innerHTML = "";
  roomSelect.innerHTML = `<option value="" disabled selected>Pilih Nomor Ruangan</option>`;
  rooms.forEach((room) => {
    const row = document.createElement("tr");
    row.innerHTML = `
              <td class="py-3 px-4 border-b border-gray-600">${room.number}</td>
              <td class="py-3 px-4 border-b border-gray-600">${
                room.capacity
              }</td>
              <td class="py-3 px-4 border-b border-gray-600">${
                room.reserved.length > 0 ? "Terisi" : "Tersedia"
              }</td>
          `;
    roomList.appendChild(row);

    const option = document.createElement("option");
    option.value = room.number;
    option.textContent = room.number;
    roomSelect.appendChild(option);
  });
}

// Menampilkan daftar reservasi di halaman reservasi
// function displayReservations() {
//   if (!reservationList) return; // Pastikan hanya di halaman "Daftar Reservasi"
//   reservationList.innerHTML = ""; // Reset daftar reservasi

//   rooms.forEach((room) => {
//     room.reserved.forEach((reservation) => {
//       const listItem = document.createElement("li");
//       listItem.className = "mb-2 flex justify-between items-center";
//       listItem.innerHTML = `
//                   <span>${reservation.name} - Ruangan ${room.number} (${reservation.date} ${reservation.startTime}, Durasi: ${reservation.duration} jam)</span>
//                   <button onclick="confirmCancel('${room.number}', '${reservation.startTime}', '${reservation.date}')" class="bg-red-500 p-1 rounded hover:bg-red-600 transition">Batalkan</button>
//               `;
//       reservationList.appendChild(listItem);
//     });
//   });
// }

function displayReservations() {
  if (!reservationList) return; // Pastikan hanya di halaman "Daftar Reservasi"
  reservationList.innerHTML = ""; // Reset daftar reservasi

  let hasReservation = false;

  rooms.forEach((room) => {
    room.reserved.forEach((reservation) => {
      hasReservation = true;
      const listItem = document.createElement("div");
      listItem.className =
        "mb-4 p-4 bg-gray-700 rounded-lg shadow-lg flex justify-between items-center";
      listItem.innerHTML = `
          <div>
            <h3 class="text-lg font-semibold text-blue-300">Ruangan ${room.number}</h3>
            <p class="text-gray-300">${reservation.name} - ${reservation.date} ${reservation.startTime}</p>
            <p class="text-gray-400">Durasi: ${reservation.duration} jam</p>
          </div>
          <button onclick="confirmCancel('${room.number}', '${reservation.startTime}', '${reservation.date}')"
    class="bg-red-500 p-2 rounded-full hover:bg-red-600 transition flex items-center justify-center" 
    aria-label="Batalkan Reservasi">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </button>
        `;
      reservationList.appendChild(listItem);
    });
  });

  // Tampilkan pesan "Tidak ada reservasi" jika tidak ada reservasi
  if (!hasReservation) {
    const noReservationsMessage = document.createElement("div");
    noReservationsMessage.textContent = "Tidak ada reservasi";
    noReservationsMessage.className =
      "text-gray-400 italic text-center bg-gray-700 p-4 rounded-lg shadow";
    reservationList.appendChild(noReservationsMessage);
  }
}

// Event listener untuk form reservasi
reservationForm?.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const roomNumber = roomSelect.value;
  const reservationDate = document.getElementById("reservationDate").value;
  const startTime = document.getElementById("startTime").value;
  const duration = document.getElementById("duration").value;

  const room = rooms.find((r) => r.number === roomNumber);
  if (!room) {
    Swal.fire("Error!", "Ruangan tidak ditemukan.", "error");
    return;
  }

  // Validasi jika ruangan sudah terisi
  if (room.reserved.length > 0) {
    Swal.fire(
      "Error!",
      "Ruangan ini sudah terisi dan tidak tersedia.",
      "error"
    );
    return;
  }

  // Jika ruangan tersedia, lakukan reservasi
  room.reserved.push({ name, date: reservationDate, startTime, duration });
  saveToLocalStorage(); // Simpan ke localStorage
  displayRooms();
  displayReservations();
  reservationForm.reset();

  // Menampilkan alert konfirmasi
  Swal.fire({
    title: "Berhasil!",
    text: "Reservasi berhasil dibuat.",
    icon: "success",
    confirmButtonText: "OK",
  }).then(() => {
    closeModal(); // Menutup modal setelah berhasil
  });
});

// Menutup modal
function closeModal() {
  document.getElementById("reservationModal").classList.add("hidden");
}

// Membuka modal
function openModal() {
  document.getElementById("reservationModal").classList.remove("hidden");
}

// Konfirmasi pembatalan reservasi
function confirmCancel(roomNumber, startTime, date) {
  Swal.fire({
    title: "Batalkan Reservasi?",
    text: "Apakah Anda yakin ingin membatalkan reservasi ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, batalkan!",
  }).then((result) => {
    if (result.isConfirmed) {
      cancelReservation(roomNumber, startTime, date);
      Swal.fire("Dibatalkan!", "Reservasi telah dibatalkan.", "success");
    }
  });
}

// Pembatalan reservasi
function cancelReservation(roomNumber, startTime, date) {
  const room = rooms.find((r) => r.number === roomNumber);
  if (room) {
    room.reserved = room.reserved.filter(
      (reservation) =>
        !(reservation.startTime === startTime && reservation.date === date)
    );
    saveToLocalStorage();
    displayRooms();
    displayReservations();
  }
}

// Memuat data saat halaman terbuka
window.onload = function () {
  loadFromLocalStorage();
  displayRooms();
  displayReservations(); // Pastikan data reservasi juga dimuat
};
