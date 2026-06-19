{
  "rewrites": [
    { "source": "/api/chat",     "destination": "/api/chat.js" },
    { "source": "/api/register", "destination": "/api/register.js" },
    { "source": "/(.*)",         "destination": "/public/$1" }
  ]
}
