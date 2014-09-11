get '/' do
  @question = current_user.get_unanswered_question || Question.get_random_question()

  erb :index
end

post '/question/:id/pin/new' do
  @question = Question.find(params[:id])
  @pin = @question.pins.new(x: params[:x], y: params[:y])

  if @pin.valid?
    @pin.save!
    current_user.pins << @pin

    content_type :json
    @question.get_pin_data(@pin).to_json
  end
end

put '/question/:id/pin/' do
  @question = Question.find(params[:id])
  @pin = @question.pins.where(user_id: current_user.id).first
  @pin.update_position(params) unless @pin.nil?
end

get '/all' do
  @pins = Pin.all
  erb :index
end

get '/question' do
  content_type :json

  current_user.get_questions_as_json
end

get '/question/random' do
  @question = current_user.get_unanswered_question
  content_type :json

  if @question
    { id: @question.id, content: @question.content }.to_json
  else
    # GAME OVER
    {}.to_json
  end
end

get '/question/:id' do
  question = Question.find(params[:id])
  content_type :json

  if current_user.questions.include?(question)
    pin_data = question.get_pin_data
    pin_data[:user_pin] = question.get_pin_data_for_user(current_user.id)
    pin_data.to_json
  else
    question.to_json
  end
end

post '/user/new' do
  find_or_create_user
end

get '/user/new/force' do
  session[:id] = nil
  session.clear
  force_create_user
  redirect '/'
end
