import React from 'react';
import { Recipe } from '../types';
import { ChefHatIcon } from './icons';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  if (recipe.error) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-light-card dark:bg-dark-card shadow-lg rounded-2xl p-8 border border-light-border dark:border-dark-border animate-fade-in">
        <div className="text-center">
            <ChefHatIcon className="w-12 h-12 mx-auto text-primary-default mb-4"/>
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">Oops!</h2>
            <p className="text-light-subtle-text dark:text-dark-subtle-text">{recipe.error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto bg-light-card dark:bg-dark-card shadow-lg rounded-2xl p-8 border border-light-border dark:border-dark-border animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-light-text dark:text-dark-text mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-default to-blue-400">{recipe.recipeName}</h1>
        <p className="text-light-subtle-text dark:text-dark-subtle-text max-w-2xl mx-auto">{recipe.description}</p>
      </div>

      <div className="flex justify-center gap-8 text-center mb-8 text-light-text dark:text-dark-text">
        <div>
          <p className="text-sm text-light-subtle-text dark:text-dark-subtle-text">Prep Time</p>
          <p className="font-bold">{recipe.prepTime}</p>
        </div>
        <div>
          <p className="text-sm text-light-subtle-text dark:text-dark-subtle-text">Cook Time</p>
          <p className="font-bold">{recipe.cookTime}</p>
        </div>
        <div>
          <p className="text-sm text-light-subtle-text dark:text-dark-subtle-text">Servings</p>
          <p className="font-bold">{recipe.servings}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4 border-b-2 border-primary-default pb-2">Ingredients</h2>
          <ul className="space-y-2 list-disc list-inside text-light-subtle-text dark:text-dark-subtle-text">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4 border-b-2 border-primary-default pb-2">Instructions</h2>
          <ol className="space-y-4 text-light-subtle-text dark:text-dark-subtle-text list-decimal list-inside">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="pl-2">
                <span className="font-semibold text-light-text dark:text-dark-text">Step {index + 1}:</span> {instruction}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
