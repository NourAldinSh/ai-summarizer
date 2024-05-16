import { useEffect, useState, useCallback } from "react";
import logo from "../assets/logo.png";
import { IoMdCopy } from "react-icons/io";
import { RiDeleteBinLine } from "react-icons/ri";

const apiKey = import.meta.env.VITE_RAPIDAI_KEY;

const Hero = () => {
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setInputValue("");

      if (inputValue === "") {
        return;
      }

      const url = "https://tldrthis.p.rapidapi.com/v1/model/extractive/summarize-text/";
      const options = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "tldrthis.p.rapidapi.com",
        },
        body: JSON.stringify({
          text: inputValue,
          num_sentences: 5,
        }),
      };

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const dataRes = await response.json();
        const text = dataRes.summary[1];

        const updatedData = [...data, text];
        localStorage.setItem("summary", JSON.stringify(updatedData));
        setData(updatedData);
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
    [inputValue]
  );

  const fetchLocalStorage = useCallback(() => {
    const result = localStorage.getItem("summary");
    setData(JSON.parse(result) || []);
  }, []);

  const handleCopy = useCallback(
    async (text, index) => {
      setCopyStatus({ ...copyStatus, [index]: true });

      if ("clipboard" in navigator) {
        try {
          await navigator.clipboard.writeText(text);
          setTimeout(() => {
            // Reset the copy status after 2 seconds
            setCopyStatus({ ...copyStatus, [index]: false });
          }, 2000);
        } catch (error) {
          console.error("Copy to clipboard failed:", error);
        }
      }
    },
    [copyStatus]
  );

  const handleDelete = useCallback(
    (text) => {
      const updatedData = data.filter((d) => d !== text);
      localStorage.setItem("summary", JSON.stringify(updatedData));
      setData(updatedData);
    },
    [data]
  );

  useEffect(() => {
    fetchLocalStorage();
  }, []);

  return (
    <>
      <header className="w-full flex justify-center items-center flex-col">
        <nav className="flex justify-between items-center w-full mb-10 pt-3">
          <img src={logo} alt="sumz_logo" className="object-contain w-[85px]" />
          <button type="button" onClick={() => window.open("https://github.com/NourAldinSh")} className="black_btn">
            Github
          </button>
        </nav>
        <h1 className="head_text">
          Summarize Documents Using <br className="max-md:hidden" /> <span className="orange_gradient">OpenAI GPT-4</span>
        </h1>
        <h2 className="desc">Simplify reading with Summize, an open-source article summarizer that turns long articles into concise summaries.</h2>
      </header>
      {/* ============ */}
      <section className="mt-16 w-full max-w-2xl">
        <div className="flex flex-col w-full gap-2">
          <form className="relative flex justify-center items-center" onSubmit={handleSubmit}>
            <textarea
              id="textarea"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="text_input peer min-h-[100px]"
              placeholder="Enter a document content here"
              required
            ></textarea>
            <button type="submit" className="submit_btn ease-in-out duration-[250ms] peer-focus:border-[#445267] ">
              ↵
            </button>
          </form>
        </div>
        <div>
          {submitting && <p className="text-center text-2xl my-8 font-semibold text-gray-300">Loading...</p>}
          {data?.length > 0 && <h2 className="text-center text-2xl my-8 font-semibold text-gray-300">Summary History</h2>}
        </div>
        <div className="flex flex-col gap-5">
          {(data || []).map((d, index) => (
            <div
              key={index}
              className="rounded-md border border-[#2c3747] bg-[#192739]  p-3  text-sm shadow-lg font-satoshi font-medium text-gray-400"
            >
              <p className="mb-1">{d}</p>
              <div className="flex gap-2 justify-end">
                <span className="cursor-pointer hover:text-gray-500 ease-in-out duration-[250ms]" onClick={() => handleCopy(d, index)}>
                  {copyStatus[index] ? "Copied" : <IoMdCopy fontSize={20} />}
                </span>
                <span className="cursor-pointer hover:text-red-500 ease-in-out duration-[250ms]" onClick={() => handleDelete(d)}>
                  <RiDeleteBinLine fontSize={20} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Hero;
