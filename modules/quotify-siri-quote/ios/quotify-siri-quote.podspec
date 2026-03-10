Pod::Spec.new do |s|
  s.name           = 'quotify-siri-quote'
  s.version        = '1.0.0'
  s.summary        = 'Siri quote cache for Quotify'
  s.description    = 'Writes today\'s quote to App Group UserDefaults for App Intents / Siri'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
