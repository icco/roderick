require 'nokogiri'
require 'open-uri'

filename = File.expand_path '~/Downloads/gcide-0.51/CIDE.A'
@db = {}
File.open(filename, "r:ISO-8859-1") do |file|
  chunks = file.read.split(/\n\n/).select{|chunk| chunk =~ /^[<\[]\w/}    

    chunks.each do |chunk|
      doc = Nokogiri::XML(chunk)
      ent = doc.css("ent").map{|n| n.text}.join(" ")
      pos = doc.css("pos").map{|n| n.text}.join(" ")
      if pos != "" and ent != ""
        @db[ent] = pos.split(/\s+/).map{|p| p.gsub(/\./, "")}.join(" ")
      end
    end
end

p @db
