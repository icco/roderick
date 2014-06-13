class Dictionary
  attr_accessor :data

  def initialize
    @data = {}
  end

  def self.load
    dict = Dictionary.new
    Zlib::GzipReader.open('dict.json.gz') {|gz| dict.data = Oj.load(gz.read) }
    return dict
  end
end
