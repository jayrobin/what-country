require 'yaml'

class QuestionLoader
  def self.load(filename)
    YAML.load_file(filename).each do |line|
      category = self.create_category(line["category"])
      self.create_questions(category, line["questions"])
    end
  end

  def self.create_category(category_name)
    Category.create(name: category_name)
  end

  def self.create_questions(category, questions)
    questions.each do |question|
      category.questions.create(content: question)
    end
  end
end
