def current_user
  if session[:id]
    User.find(session[:id])
  else
    create_user
  end
end

def create_user
  user = User.create(username: request.ip)
  session[:id] = user.id
  user
end
