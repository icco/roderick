require 'bundler/setup'
Bundler.require(:default)

task :default => :test

desc "Run a local server."
task :local do
  Kernel.exec("shotgun -s thin -p 9393")
end

desc "Build database from gcide files."
task :build do
  @db = {}
  Dir.glob('./gcide/CIDE.*').each do |filename|
    puts filename
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

      p @db.keys.count

      lib::GzipWriter.open('dict.json.gz') do |gz|
        gz.write(Oj.dump(@db))
      end
    end
  end
end
