class Dictionary
  def initialize
    @data = {}
  end

  def self.load
    dict = Dictionary.new
    Zlib::GzipReader.open('dict.json.gz') {|gz| dict.data = Oj.parse(gz.read) }
    return dict
  end
end
