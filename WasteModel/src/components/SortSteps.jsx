import React from "react";

export function Breadcrumbs({ category, group, item, onNavigate }) {
  const parts = [];

  if (category) parts.push(["category", category.name]);
  if (group) parts.push(["group", group.name]);
  if (item) parts.push(["item", item.name]);

  return (
    <div className="qs-breadcrumbs">
      {parts.map(([step, label], i) => (
        <span key={i}>
          <button className="qs-breadcrumb-link" 
            onClick={() => onNavigate(step)}>
            {label}
          </button>
          {i < parts.length - 1 && <span className="qs-breadcrumb-arrow">›</span>}
        </span>
      ))}
    </div>
  );
}

export function CategoryStep({ data, onSelect }) {
  return (
    <div>

      <div className="qs-step-header">
        <div className="qs-line"></div>
        <span className="qs-step-number">Step 1 of 4</span>
        <div className="qs-line"></div>
      </div>
      <h2>Select a Category</h2>

      <div className="qs-grid">
        {data.map((category) => (
          <button 
          key={category.id} 
          className="qs-card" 
          onClick={() => onSelect(category)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ItemGroupStep({ category, onSelect, onBack}) {
  return (
    <div>

      <div className="qs-step-header">
        <div className="qs-line"></div>
        <span className="qs-step-number">Step 2 of 4</span>
        <div className="qs-line"></div>
      </div>

      <h2>Select an Item Group</h2>
      
      <button className="qs-back" onClick={onBack}>Back</button>

      <div className="qs-grid">
        {(category.itemGroups || []).map((group) => (
          <button 
          key={group.name} 
          className="qs-card" 
          onClick={() => onSelect(group)}
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ItemStep({ group, onSelect, onBack }) {
  const items = group.items || [];

  return (
    <div>

      <div className="qs-step-header">
        <div className="qs-line"></div>
        <span className="qs-step-number">Step 3 of 4</span>
        <div className="qs-line"></div>
      </div>

      <h2>Select an Item</h2>
      <button className="qs-back" onClick={onBack}>Back</button>

      <div className="qs-grid">
        {items.map((item) => (
          <button key={item.name} 
          className="qs-card" 
          onClick={() => onSelect(item)}>
          {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConditionStep({ 
  item,
  cleanliness,
  shape, 
  setCleanliness, 
  setShape, 
  onNext, 
  onBack
}) {

  const { 
    cleanliness: cleanlinessOptions = [], 
    shape: shapeOptions = [] 
  } = item.allowedConditionValues || {};

  function getClass(selectedValue, option) {
    let classes = "qs-card";
    if (selectedValue === option) {
      classes += " selected" ;
    }
    return classes;
  }

  return (
    <div>

      <div className="qs-step-header">
        <div className="qs-line"></div>
        <span className="qs-step-number">Step 4 of 4</span>
        <div className="qs-line"></div>
      </div>

      <h2>Select Conditions</h2>

      <button className="qs-back" onClick={onBack}>Back</button>

      {cleanlinessOptions.length > 0 && (
        <>
          <h3>Cleanliness</h3>

          <div className="qs-grid">
            {cleanlinessOptions.map((option) => (
              <button 
                key={option}
                className={getClass(cleanliness, option)}
                onClick={() => setCleanliness(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {shapeOptions.length > 0 && (
        <>
          <h3>Shape</h3>

          <div className="qs-grid">
            {shapeOptions.map((option) => (
              <button 
                key={option}
                className={getClass(shape, option)}
                onClick={() => setShape(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
      <button className="qs-button" onClick={onNext}>Finish Sorting</button>
    </div>
  );
}
