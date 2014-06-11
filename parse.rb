require 'nokogiri'

@db = {}
Dir.glob('./gcide/CIDE.*').each do |filename|
  File.open(filename, "r:ISO-8859-1") do |file|
    chunks = file.read.split(/\n\n/).select{|chunk| chunk =~ /^[<\[]\w/ }

      chunks.each do |chunk|
        doc = Nokogiri::XML(chunk)
        ent = doc.css("ent").map{|n| n.text }.join(" ")
        pos = doc.css("pos").map{|n| n.text }.join(" ")
        dei = doc.css("def").map{|n| n.text }.join(" ")
        if pos != "" and ent != "" and !dei.empty?
          #@db[ent] = pos.split(/\s+/).map{|p| p.gsub(/\./, "")}.join(" ")
          @db[ent] = dei
        end
      end
  end
end

p @db.count
