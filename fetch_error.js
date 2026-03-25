async function getError() {
  const res = await fetch('http://localhost:8080/api/trajets');
  const text = await res.text();
  console.log(res.status, text);
}
getError();
