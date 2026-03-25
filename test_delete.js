async function debugDelete() {
  try {
    const email = 'debug' + Date.now() + '@test.com';
    
    // 1. Register
    const regRes = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: 'Test',
        prenom: 'User',
        email: email,
        password: 'password',
        telephone: '0600000000',
        role: 'CONDUCTEUR'
      })
    });
    console.log("Register status: ", regRes.status);
    
    // 2. Login
    const loginRes = await fetch('http://localhost:8080/api/auth/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: 'password' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Token received");

    // 3. Create trip
    const tripRes = await fetch('http://localhost:8080/api/trajets', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        villeDepart: 'Casablanca',
        villeArrivee: 'Rabat',
        dateDepart: '2027-01-01',
        heureDepart: '10:00',
        placesDisponibles: 3,
        prix: 50,
        typeTrajet: 'VILLE_A_VILLE'
      })
    });
    const tripData = await tripRes.json();
    const tripId = tripData.id;
    console.log("Trip created: ", tripId);
    
    // 4. Delete trip
    const delRes = await fetch('http://localhost:8080/api/trajets/' + tripId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log("Delete status:", delRes.status);
    if (!delRes.ok) {
        console.log("Delete text: ", await delRes.text());
    }

  } catch(e) { console.error("Script failed", e); }
}
debugDelete();
