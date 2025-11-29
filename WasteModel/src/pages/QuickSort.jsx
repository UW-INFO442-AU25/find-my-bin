import React, { useState } from "react";
import data from "../data/item_dataset.json";
import SortItem from "../components/SortItem";
import recycleImage from "../assets/bins/recycle.png";
import compostImage from "../assets/bins/compost.png";
import landfillImage from "../assets/bins/landfill.png";
import {CategoryStep, ItemGroupStep, ItemStep, ConditionStep, Breadcrumbs} from "../components/SortSteps";
import "../styles/QuickSort.css";

const binImages = {
  Recycle: recycleImage,
  Compost: compostImage,
  Landfill: landfillImage
};

export default function QuickSort() {

  const [step, setStep] = useState("category");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [cleanliness, setCleanliness] = useState("");
  const [shape, setShape] = useState("");

  const [binResult, setBinResult] = useState("");

  const resetRules = {
    category: ["selectedCategory", "selectedGroup", "selectedItem", "cleanliness", "shape"],
    group:    ["selectedGroup", "selectedItem", "cleanliness", "shape"],
    item:     ["selectedItem", "cleanliness", "shape"],
    conditions: [],
    result: []
  };

  function clearSelections(keys) {
    keys.forEach((key) => {
      if (key === "selectedCategory") setSelectedCategory(null);
      if (key === "selectedGroup") setSelectedGroup(null);
      if (key === "selectedItem") setSelectedItem(null);
      if (key === "cleanliness") setCleanliness("");
      if (key === "shape") setShape("");
    });
  }

  function handleCategorySelect(category) {
    setSelectedCategory(category);
    setStep("group");
  }

  function handleGroupSelect(group) {
    setSelectedGroup(group);
    setStep("item");
  }

  function handleItemSelect(item) {
    setSelectedItem(item);

    if (item.skipConditions) {
      const resultBin = item.defaultBin || "Landfill";
      setBinResult(resultBin);
      setStep("result");
    } else {
      clearSelections(["cleanliness", "shape"]);
      setStep("conditions");
    }
  }

  function handleFinishSorting() {
    const resultBin = SortItem(selectedItem, cleanliness, shape);
    setBinResult(resultBin);
    setStep("result");
  }

  function goBack() {
    let target;
    if (step === "result") {
      target = selectedItem.skipConditions ? "item" : "conditions";
    } 

    else {
      const backMap = {
        group: "category",
        item: "group",
        conditions: "item",
      };
      target = backMap[step];
    }

    clearSelections(resetRules[target]);
    setStep(target);
  }

  function handleBreadcrumbNav(targetStep) {
    clearSelections(resetRules[targetStep]);
    setStep(targetStep);
  }

  function handleStartOver() {
    clearSelections(resetRules.category);
    setStep("category");
  }

  function getResultMessage(item, bin, cleanliness, shape) {
    if (item.skipConditions) {
      if (bin === "Recycle") {
        return "This item is always recyclable.";
      }
      if (bin === "Compost") {
        return "This item is always compostable.";
      }
      return "This item always belongs in the landfill.";
    }

    if (shape === "Smaller than 3 inches") {
      return "Items smaller than 3 inches cannot be sorted by recycling machines and must go into the landfill.";
    }

    if (cleanliness === "Food-Soiled") {
      if (bin === "Compost") {
        return "Because this item is food-soiled and its material is compostable, it belongs in the compost.";
      }
      if (bin === "Landfill") {
        return "Food contamination prevents this item from being recycled, so it must go into the landfill.";
      }
    }

    if (cleanliness === "Sticky / Residue") {
      return "Sticky or oily residue prevents proper recycling. Because of the contamination, this item must go into the landfill.";
    }

    if (cleanliness === "Clean / Rinsed") {
      if (bin === "Recycle") {
        return "This item is clean and empty, which makes it acceptable for recycling.";
      }
      if (bin === "Compost") {
        return "Because this item is clean and made of compostable material, it belongs in the compost.";
      }
    }

    return `This item belongs in the ${bin} bin.`;
  }

  return (
    <div className="qs-container">
      {step === "category" && (
        <>
          <h1 className="qs-title">Quick Sort</h1>
          <p className="qs-description">
            Answer a few quick questions to find the correct waste bin for your item.
          </p>
        </>
      )}
  
      {step !== "category" && step !== "result" && (
        <Breadcrumbs
          category={selectedCategory}
          group={selectedGroup}
          item={selectedItem}
          onNavigate={handleBreadcrumbNav}
        />
      )}

      {step === "result" && (
        <>
          <div className="qs-top-bar">
            <button className="qs-back" onClick={goBack}>← Back</button>
            <h1 className="qs-recommend-title">Recommendation</h1>
            <button className="qs-start-over" onClick={handleStartOver}>
              Start Over
            </button>
          </div>

          <div className="qs-panel qs-result-card">
            <h2 className="qs-bin-heading">{binResult}</h2>
            {binImages[binResult] && (
              <img
                src={binImages[binResult]}
                alt={`${binResult} bin`}
                className="qs-bin-img"
              />
            )}

            <h2 className="qs-item-name">{selectedItem?.name}</h2>

            {(cleanliness || shape) && (
              <div className="qs-item-conditions">
                {cleanliness}
                {cleanliness && shape ? " • " : ""}
                {shape}
              </div>
            )}

            <div className="qs-explanation">
              {getResultMessage(selectedItem, binResult, cleanliness, shape)}
            </div>
          </div>
        </>
      )}
  
      {step !== "result" && (
        <div className="qs-panel qs-centered-panel">
          {step === "category" && (
            <CategoryStep
              data={data.categories}
              onSelect={handleCategorySelect}
            />
          )}
  
          {step === "group" && (
            <ItemGroupStep
              category={selectedCategory}
              onSelect={handleGroupSelect}
              onBack={goBack}
            />
          )}
  
          {step === "item" && (
            <ItemStep
              group={selectedGroup}
              onSelect={handleItemSelect}
              onBack={goBack}
            />
          )}
  
          {step === "conditions" && (
            <ConditionStep
              item={selectedItem}
              cleanliness={cleanliness}
              shape={shape}
              setCleanliness={setCleanliness}
              setShape={setShape}
              onNext={handleFinishSorting}
              onBack={goBack}
            />
          )}
        </div>
      )}
    </div>
  );  
}
