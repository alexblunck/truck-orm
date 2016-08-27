<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $fillable = ['name', 'email'];

    protected $with = ['sections'];

    public function sections()
    {
        return $this->hasMany('App\ResumeSection');
    }
}
