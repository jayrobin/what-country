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
    @question.get_all_pins_as_json
  end
end

get '/all' do
  @pins = Pin.all
  erb :index
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

post '/user/new' do
  find_or_create_user
end
