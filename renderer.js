document.getElementById('fetchButton').addEventListener('click', () => {
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => {
        document.getElementById('result').innerText = JSON.stringify(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
  