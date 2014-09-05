get '/' do
  @question = Question.get_random_question
  erb :index
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
  @question = Question.get_random_question

  content_type :json
  { id: @question.id, content: @question.content }.to_json
end
