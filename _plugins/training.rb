module Jekyll
  class TrainingDataGenerator < Generator
    safe true
    priority :lowest

    def generate(site)
      training_lessons = site.collections['training'].docs.sort_by { |lesson| lesson.data['id'].to_s }
      
      puts "Found #{training_lessons.size} lessons in 'training' collection"

      sections = {}

      training_lessons.each do |lesson|
        section_number = lesson.data['id'].to_s.split('.').first.to_i
        section_title = lesson.data['section'] || "Section #{section_number}"

        sections[section_number] ||= {
          'title' => section_title,
          'number' => section_number,
          'lessons' => []
        }

        lesson_data = {
          'lesson' => lesson.data['id'].to_s,
          'title' => lesson.data['title'],
          'start_time' => lesson.data['start_time'],
          'end_time' => lesson.data['end_time'],
          'video_url' => lesson.data['video_url']
        }

        puts "Adding lesson: #{lesson_data}"

        sections[section_number]['lessons'] << lesson_data
      end

      sorted_sections = sections.values.sort_by { |section| section['number'] }

      if sorted_sections.empty?
        puts "No sections were generated!"
      else
        puts "Generated #{sorted_sections.size} sections!"
      end

      site.data['training'] = sorted_sections

      file_path = File.join(site.source, '_data/training.yml')
      File.open(file_path, 'w') do |file|
        file.write(sorted_sections.to_yaml)
      end

      puts "Training data written to #{file_path}"
    end
  end
end
