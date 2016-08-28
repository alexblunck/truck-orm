<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $fillable = ['name', 'email', 'options', 'is_sent'];

    protected $with = ['sections'];

    protected $casts = ['options' => 'array', 'is_sent' => 'boolean'];

    public function sections()
    {
        return $this->hasMany('App\ResumeSection');
    }
}
