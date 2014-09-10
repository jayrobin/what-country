require_relative 'question_loader'


Category.delete_all
Question.delete_all
Pin.delete_all

QuestionLoader.load("./db/questions.yml")
# User.delete_all
# (1..100).each do |i|
# 	User.create(username: i)
# end

# Pin.delete_all

# User.all.each do |user|
# 	Question.all.each do |question|
# 		pin = question.pins.create(get_random_pos)
# 		user.pins << pin
# 	end
# end

# def get_random_pos
# 	{x: rand(-180..180), y: rand(-85..85)}
# end
