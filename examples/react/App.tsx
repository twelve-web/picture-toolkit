import { useEffect, useRef, useState } from 'react'
import { Eraser } from 'picture-toolkit'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [eraser, setEarser] = useState<Eraser | null>(null)
  const [imgList, setImgList] = useState<string[]>([])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImgFile(file)
    }
  }

  useEffect(() => {
    if (imgFile && containerRef.current) {
      const newEarser = new Eraser({
        imgFile: imgFile,
        onMaskChange: (originalBase64: string, maskBase64: string) => {
          console.log(originalBase64, maskBase64, '===')
          setImgList([ originalBase64, maskBase64])
        }
      })
      
      newEarser.mount(containerRef.current)
      setEarser(newEarser)
    }
  }, [imgFile])



  return (
    <div>
      <h1>Eraser React Demo</h1>
      <div 
        ref={containerRef} 
        style={{
          width: '500px',
          height: '500px',
          border: '1px solid #000'
        }}
      ></div>
      <input type="file" onChange={handleFileChange} />
      {imgList.map((item, index) => (
        <img key={index} className='img' style={{width: '100px', height: '100px'}} src={item} alt="img" />
      ))}
    </div>
  ) 
}

export default App 