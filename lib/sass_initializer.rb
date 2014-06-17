module SassInitializer
  def self.registered(app)
    # Enables support for SASS template reloading in rack applications.
    # See http://nex-3.com/posts/88-sass-supports-rack for more details.
    require 'sass/plugin/rack'
    Sass::Plugin.options[:always_update]     = app.settings.development?
    Sass::Plugin.options[:css_location]      = app.settings.root + "/public/css"
    Sass::Plugin.options[:full_exception]    = app.settings.development?
    Sass::Plugin.options[:never_update]      = app.settings.production?
    Sass::Plugin.options[:style]             = :compressed
    Sass::Plugin.options[:template_location] = app.settings.root + "/views/css"
    app.use Sass::Plugin::Rack
  end
end
