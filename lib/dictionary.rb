class Dictionary
  attr_accessor :data

  def initialize
    @data = {}
  end

  def to_a
    self.data.to_a.map {|e| Hash['word', e[0], 'definition', e[1]] }
  end

  def self.load
    dict = Dictionary.new
    Zlib::GzipReader.open('dict.json.gz') {|gz| dict.data = Oj.load(gz.read) }
    return dict
  end
end
