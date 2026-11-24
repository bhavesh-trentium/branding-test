Pod::Spec.new do |s|
  s.name = 'BrandLabDynamicBranding'
  s.version = '1.0.0'
  s.summary = 'BrandLab app icons and widget integration.'
  s.description = 'Local Expo Module that switches alternate icons and synchronizes native widget state.'
  s.license = { :type => 'MIT' }
  s.author = 'BrandLab'
  s.homepage = 'https://example.invalid/brandlab'
  s.source = { :git => 'https://example.invalid/brandlab.git', :tag => s.version.to_s }
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.static_framework = true
  s.source_files = '*.swift'
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
