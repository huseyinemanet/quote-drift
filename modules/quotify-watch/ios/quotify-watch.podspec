Pod::Spec.new do |s|
  s.name           = 'quotify-watch'
  s.version        = '1.0.0'
  s.summary        = 'WatchConnectivity sync for Quotify Watch app'
  s.description    = 'Sends quote payload to Apple Watch via WCSession'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'WatchConnectivity'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
