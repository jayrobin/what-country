def current_user
  if session[:id]
    User.where(id: params[:id]).first || find_or_create_user
  else
    find_or_create_user
  end
end

def find_or_create_user
  user = User.find_or_create_by(username: request.ip)
  session[:id] = user.id
  user.set_location(params[:location]) if params[:location]
  user
end
