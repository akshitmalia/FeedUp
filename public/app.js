

function register(){
    
}

function login(){

}

  // Check if token exists in localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    // No token → redirect immediately
    window.location.href = "/feedup/login";
  } else {
    // Verify token with backend
    fetch("/feedup/check", {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
    .then(response => {
      if (response.status === 401) {
        // Invalid/expired token → redirect
        window.location.href = "/feedup/login";
      }
    })
    .catch(err => {
      console.error("Error:", err);
      window.location.href = "/feedup/login";
    });
  }