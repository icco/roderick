require 'nokogiri'
require 'open-uri'

# Get a Nokogiri::HTML::Document for the page we’re interested in...
#
doc = Nokogiri::XML(open('./gcide_xml/gcide_a.xml'))
p doc
p doc.css('p')
