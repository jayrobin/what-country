def current_user
  if session[:id]
    User.find(session[:id])
  else
    find_or_create_user
  end
end

def find_or_create_user
  user = User.find_or_create_by(username: request.ip)
  session[:id] = user.id
  user.set_location(params[:x], params[:y]) if params[:x] && params[:y]
  user
end
