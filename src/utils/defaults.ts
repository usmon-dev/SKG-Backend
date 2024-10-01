// const now = new Date();
// const hours = String(now.getHours()).padStart(2, "0");
// const minutes = String(now.getMinutes()).padStart(2, "0");
// const day = String(now.getDate()).padStart(2, "0");
// const month = String(now.getMonth() + 1).padStart(2, "0");
// const year = now.getFullYear();

// export const time = `${hours}:${minutes}`;
// export const date = `${day}.${month}.${year}`;

// export const dateAndTime = `${date} ${time}`;

const now = new Date();
const formattedDate = now.toLocaleString('ru-RU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});
const [datePart, timePart] = formattedDate.split(' ');
const finalFormat = `${datePart.replace(',', '')} ${timePart}`;

export const dateAndTime = finalFormat;