module Jekyll
    module LazyImageFilter
      def add_lazy_loading(content)
        content.gsub(/<img(.*?)>/, '<img\1 loading="lazy">')
      end
    end
  end
  
  Liquid::Template.register_filter(Jekyll::LazyImageFilter)
  