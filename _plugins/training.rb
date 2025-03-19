module Jekyll
    class TrainingDataGenerator < Generator
      safe true
      priority :lowest
  
      def generate(site)
        training_lessons = site.collections['training'].docs.sort_by { |lesson| lesson.data['id'] }
  
        sections = {}
        
        training_lessons.each do |lesson|
          section_number = lesson.data['id'].split('.').first.to_i
          section_title = lesson.data['section'] || "Section #{section_number}"
          
          sections[section_number] ||= {
            'title' => section_title,
            'number' => section_number,
            'lessons' => []
          }
  
          sections[section_number]['lessons'] << {
            'lesson' => lesson.data['id'],
            'title' => lesson.data['title'],
            'start_time' => lesson.data['start_time'],
            'end_time' => lesson.data['end_time'],
            'video_url' => lesson.data['video_url']
          }
        end
  
        sorted_sections = sections.values.sort_by { |section| section['number'] }
  
        site.data['training'] = sorted_sections
  
        File.open(File.join(site.source, '_data/training.yml'), 'w') do |file|
          file.write(sorted_sections.to_yaml)
        end
      end
    end
  end
  