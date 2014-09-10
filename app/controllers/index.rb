get '/' do
  @question = current_user.get_unanswered_question
  if @question
    erb :index
  else
    # GAME OVER
  end
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
  p @pin
  p params
  unless @pin.nil?
    @pin.x = params[:x]
    @pin.y = params[:y]
    @pin.save!
  end
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
